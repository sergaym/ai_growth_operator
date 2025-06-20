"""
Video Generation Workflow Service.
Orchestrates the complete text-to-speech + lipsync workflow.
"""

import asyncio
import time
import uuid
import logging
from typing import Dict, Any, Optional

from app.services.text_to_speech_service import text_to_speech_service
from app.services.lipsync_service import lipsync_service
from app.api.v1.schemas.video_generation_schemas import (
    WorkflowStatus,
    WorkflowStepStatus,
    VideoGenerationWorkflowRequest
)

logger = logging.getLogger(__name__)


class VideoGenerationWorkflowService:
    """Service for managing video generation workflows."""
    
    def __init__(self):
        self.job_store: Dict[str, Dict[str, Any]] = {}
    
    async def start_workflow(self, request: VideoGenerationWorkflowRequest) -> str:
        """
        Start a new video generation workflow.
        
        Args:
            request: The workflow request parameters
            
        Returns:
            job_id: Unique identifier for tracking the workflow
        """
        job_id = f"wf_{uuid.uuid4().hex}"
        timestamp = time.time()
        
        # Initialize job record
        self.job_store[job_id] = {
            "status": WorkflowStatus.PENDING,
            "created_at": timestamp,
            "updated_at": timestamp,
            "request": request.dict(),
            "steps": [],
            "current_step": None,
            "progress_percentage": 0,
            "result": None,
            "error": None
        }
        
        # Start processing in background
        asyncio.create_task(self._process_workflow(job_id, request))
        
        return job_id
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the current status of a workflow job.
        
        Args:
            job_id: The job identifier
            
        Returns:
            Job status information or None if not found
        """
        return self.job_store.get(job_id)
    
    async def _process_workflow(self, job_id: str, request: VideoGenerationWorkflowRequest):
        """
        Process the complete workflow in the background.
        
        Args:
            job_id: The job identifier
            request: The workflow request parameters
        """
        try:
            # Update job status to processing
            self._update_job_status(job_id, {
                "status": WorkflowStatus.TTS_PROCESSING,
                "current_step": "text_to_speech",
                "progress_percentage": 10
            })
            
            # Step 1: Generate Text-to-Speech
            logger.info(f"Starting TTS generation for job {job_id}")
            tts_step = self._create_step_status("text_to_speech", "processing")
            self._add_step(job_id, tts_step)
            
            try:
                audio_result = await self._generate_audio(request)
                
                # Complete TTS step
                tts_step.update({
                    "status": "completed",
                    "completed_at": time.time(),
                    "result": audio_result
                })
                self._update_step(job_id, "text_to_speech", tts_step)
                
                # Update overall progress
                self._update_job_status(job_id, {
                    "status": WorkflowStatus.TTS_COMPLETED,
                    "progress_percentage": 50
                })
                
                logger.info(f"TTS generation completed for job {job_id}")
                
            except Exception as e:
                logger.error(f"TTS generation failed for job {job_id}: {str(e)}")
                tts_step.update({
                    "status": "error",
                    "completed_at": time.time(),
                    "error": str(e)
                })
                self._update_step(job_id, "text_to_speech", tts_step)
                raise e
            
            # Step 2: Generate Lipsync
            logger.info(f"Starting lipsync generation for job {job_id}")
            self._update_job_status(job_id, {
                "status": WorkflowStatus.LIPSYNC_PROCESSING,
                "current_step": "lipsync",
                "progress_percentage": 60
            })
            
            lipsync_step = self._create_step_status("lipsync", "processing")
            self._add_step(job_id, lipsync_step)
            
            try:
                # Get audio URL from TTS result
                audio_url = audio_result.get("blob_url") or audio_result.get("file_name")
                if audio_result.get("file_name") and not audio_url:
                    # Create URL from filename if blob_url not available
                    audio_url = f"/api/v1/text-to-speech/audio/{audio_result['file_name']}"
                
                if not audio_url:
                    raise ValueError("No audio URL available from TTS generation")
                
                lipsync_result = await self._generate_lipsync(request, audio_url)
                
                # Complete lipsync step
                lipsync_step.update({
                    "status": "completed",
                    "completed_at": time.time(),
                    "result": lipsync_result
                })
                self._update_step(job_id, "lipsync", lipsync_step)
                
                logger.info(f"Lipsync generation completed for job {job_id}")
                
            except Exception as e:
                logger.error(f"Lipsync generation failed for job {job_id}: {str(e)}")
                lipsync_step.update({
                    "status": "error",
                    "completed_at": time.time(),
                    "error": str(e)
                })
                self._update_step(job_id, "lipsync", lipsync_step)
                raise e
            
            # Complete the workflow
            final_result = self._build_final_result(job_id, request, audio_result, lipsync_result)
            
            self._update_job_status(job_id, {
                "status": WorkflowStatus.COMPLETED,
                "current_step": None,
                "progress_percentage": 100,
                "result": final_result
            })
            
            logger.info(f"Workflow completed successfully for job {job_id}")
            
        except Exception as e:
            logger.error(f"Workflow failed for job {job_id}: {str(e)}")
            self._update_job_status(job_id, {
                "status": WorkflowStatus.ERROR,
                "current_step": None,
                "error": str(e)
            })
    
    async def _generate_audio(self, request: VideoGenerationWorkflowRequest) -> Dict[str, Any]:
        """Generate audio using text-to-speech service."""
        tts_request = {
            "text": request.text,
            "voice_id": request.voice_id,
            "voice_preset": request.voice_preset,
            "language": request.language or "english",
            "model_id": request.model_id or "eleven_multilingual_v2",
            "voice_settings": request.voice_settings,
            "output_format": "mp3",
            "user_id": request.user_id,
            "workspace_id": request.workspace_id
        }
        
        result = await text_to_speech_service.generate_speech(
            text=tts_request["text"],
            voice_id=tts_request["voice_id"],
            voice_preset=tts_request["voice_preset"],
            language=tts_request["language"],
            model_id=tts_request["model_id"],
            voice_settings=tts_request["voice_settings"],
            output_format=tts_request["output_format"],
            save_to_file=True,
            upload_to_blob=True,
            user_id=tts_request["user_id"],
            workspace_id=tts_request["workspace_id"],
            project_id=request.project_id
        )
        
        if result.get("status") == "error":
            raise Exception(result.get("error", "TTS generation failed"))
        
        return result
    
    async def _generate_lipsync(self, request: VideoGenerationWorkflowRequest, audio_url: str) -> Dict[str, Any]:
        """Generate lipsync using lipsync service."""
        result = await lipsync_service.lipsync(
            video_url=request.actor_video_url,
            audio_url=audio_url,
            save_result=request.save_result or True,
            user_id=request.user_id,
            workspace_id=request.workspace_id,
            project_id=request.project_id
        )
        
        if result.get("status") == "error":
            raise Exception(result.get("error", "Lipsync generation failed"))
        
        return result
    
    def _create_step_status(self, step_name: str, status: str) -> Dict[str, Any]:
        """Create a new step status record."""
        return {
            "step": step_name,
            "status": status,
            "started_at": time.time(),
            "completed_at": None,
            "error": None,
            "result": None
        }
    
    def _add_step(self, job_id: str, step: Dict[str, Any]):
        """Add a new step to the job record."""
        if job_id in self.job_store:
            self.job_store[job_id]["steps"].append(step)
            self.job_store[job_id]["updated_at"] = time.time()
    
    def _update_step(self, job_id: str, step_name: str, step_data: Dict[str, Any]):
        """Update an existing step in the job record."""
        if job_id in self.job_store:
            steps = self.job_store[job_id]["steps"]
            for i, step in enumerate(steps):
                if step.get("step") == step_name:
                    steps[i].update(step_data)
                    break
            self.job_store[job_id]["updated_at"] = time.time()
    
    def _update_job_status(self, job_id: str, updates: Dict[str, Any]):
        """Update job status and metadata."""
        if job_id in self.job_store:
            self.job_store[job_id].update(updates)
            self.job_store[job_id]["updated_at"] = time.time()
    
    def _build_final_result(
        self,
        job_id: str,
        request: VideoGenerationWorkflowRequest,
        audio_result: Dict[str, Any],
        lipsync_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Build the final workflow result."""
        job = self.job_store.get(job_id)
        
        # Enhanced blob_url extraction with explicit logging
        logger.info(f"Building final result. Lipsync result keys: {list(lipsync_result.keys())}")
        logger.info(f"Lipsync result blob_url: {lipsync_result.get('blob_url')}")
        logger.info(f"Lipsync result video_url: {lipsync_result.get('video_url')}")
        
        # Explicitly prioritize blob_url for video
        video_url = None
        if lipsync_result.get("blob_url"):
            video_url = lipsync_result["blob_url"]
            logger.info(f"Using blob_url for video: {video_url}")
        elif lipsync_result.get("video_url"):
            video_url = lipsync_result["video_url"]
            logger.info(f"Fallback to video_url: {video_url}")
        else:
            logger.warning("No video URL found in lipsync result")
        
        # Enhanced blob_url extraction for audio
        audio_url = None
        if audio_result.get("blob_url"):
            audio_url = audio_result["blob_url"]
            logger.info(f"Using blob_url for audio: {audio_url}")
        elif audio_result.get("file_name"):
            audio_url = f"/api/v1/text-to-speech/audio/{audio_result['file_name']}"
            logger.info(f"Using file_name for audio: {audio_url}")
        else:
            logger.warning("No audio URL found in audio result")
        
        final_result = {
            "text": request.text,
            "actor_id": request.actor_id,
            "project_id": request.project_id,
            "audio_url": audio_url,
            "video_url": video_url,
            "thumbnail_url": lipsync_result.get("thumbnail_url"),
            "audio_duration": audio_result.get("duration"),
            "video_duration": lipsync_result.get("duration"),
            "file_size": lipsync_result.get("file_size"),
            "processing_time": time.time() - (job.get("created_at", time.time()) if job else time.time())
        }
        return final_result


# Global service instance
video_generation_service = VideoGenerationWorkflowService() 