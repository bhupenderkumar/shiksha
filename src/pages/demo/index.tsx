import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function DemoIndex() {
  const demos = [
    {
      title: 'Enhanced Matching Exercise',
      description: 'A child-friendly matching exercise with improved UI/UX, featuring side-by-side layout, drag-and-drop interaction, visual cues, and immediate feedback.',
      path: '/demo/enhanced-matching',
      isNew: true,
    },
    // Add more demos here as they are created
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Interactive Demos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo, index) => (
          <Card key={index} className="hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                {demo.title}
                {demo.isNew && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full">
                    New
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">{demo.description}</p>
              <Link href={demo.path}>
                <Button className="w-full flex items-center justify-center gap-2">
                  View Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
