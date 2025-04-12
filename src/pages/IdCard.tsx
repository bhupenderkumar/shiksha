import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfileAccess } from '@/services/profileService';
import { IDCardForm } from '@/components/forms/id-card-form';
import { IDCardGenerator } from '@/components/id-card-generator';
import { IDCardData } from '@/services/idCardService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function IdCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { profile, isAdminOrTeacher, loading: profileLoading } = useProfileAccess();
  const [idCard, setIdCard] = useState<IDCardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('form');

  const handleIdCardCreated = (newIdCard: IDCardData) => {
    setIdCard(newIdCard);
    setActiveTab('preview');
  };

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 px-4 md:px-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Student ID Card</h1>
        <p className="text-gray-500 mt-2">
          Generate and download ID cards for students with all necessary details.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">ID Card Form</TabsTrigger>
          <TabsTrigger value="preview" disabled={!idCard}>ID Card Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-6">
          <IDCardForm 
            studentId={studentId} 
            onSuccess={handleIdCardCreated} 
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          {idCard ? (
            <IDCardGenerator idCard={idCard} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No ID Card Generated</CardTitle>
                <CardDescription>
                  Please fill out the ID card form to generate a preview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Once you've submitted the form, you'll be able to preview, download, and print the ID card.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
