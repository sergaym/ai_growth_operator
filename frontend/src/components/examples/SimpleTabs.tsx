"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SimpleTabs() {
  const [activeTab, setActiveTab] = useState("tab1")
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-[#37352f] mb-4">Content Tabs Example</h2>
      
      <Tabs defaultValue="tab1" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="tab1">First Tab</TabsTrigger>
          <TabsTrigger value="tab2">Second Tab</TabsTrigger>
          <TabsTrigger value="tab3">Third Tab</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1" className="mt-6">
          <div className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6e6e6]">
              <h3 className="text-lg font-medium text-[#37352f]">First Tab Content</h3>
            </div>
            <div className="p-6">
              <p className="text-[#6b7280]">
                This is the content of the first tab. You can place any components, forms, or content here.
                The tabs component allows you to organize content in a compact and accessible way.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tab2" className="mt-6">
          <div className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6e6e6]">
              <h3 className="text-lg font-medium text-[#37352f]">Second Tab Content</h3>
            </div>
            <div className="p-6">
              <p className="text-[#6b7280]">
                This is the content of the second tab. Each tab can contain completely different content
                and components, making it ideal for grouping related information.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tab3" className="mt-6">
          <div className="bg-white border border-[#e6e6e6] rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6e6e6]">
              <h3 className="text-lg font-medium text-[#37352f]">Third Tab Content</h3>
            </div>
            <div className="p-6">
              <p className="text-[#6b7280]">
                This is the content of the third tab. The active tab is tracked in state, allowing you
                to perform actions when tabs are changed or access the current tab value in your component.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-sm text-gray-500">
        Active tab: <span className="font-medium">{activeTab}</span>
      </div>
    </div>
  )
} 