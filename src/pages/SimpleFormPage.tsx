import React from 'react';
import { z } from 'zod';
import { FormBuilder, FieldConfig } from '@/components/common/FormBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';

// Simple contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.string().min(1, 'Please select a priority'),
  newsletter: z.boolean(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function SimpleFormPage() {
  const { success, error } = useNotifications();

  const defaultValues: ContactFormData = {
    name: '',
    email: '',
    message: '',
    priority: '',
    newsletter: false,
  };

  const fields: FieldConfig<ContactFormData>[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
    },
    {
      name: 'priority',
      label: 'Priority Level',
      type: 'select',
      placeholder: 'Select priority',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Enter your message...',
      required: true,
      rows: 4,
      description: 'Please provide details about your inquiry',
    },
    {
      name: 'newsletter',
      label: 'Newsletter',
      type: 'checkbox',
      placeholder: 'Subscribe to our newsletter for updates',
    },
  ];

  const handleSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', data);
      success('Message sent successfully!');
    } catch (err) {
      error('Failed to send message. Please try again.');
    }
  };

  const handleCancel = () => {
    success('Form cancelled');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contact Form</h1>
        <p className="text-muted-foreground">
          Simple example of the reusable form builder component
        </p>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <FormBuilder
            fields={fields}
            defaultValues={defaultValues}
            validation={contactFormSchema}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            layout="vertical"
            submitText="Send Message"
            cancelText="Clear Form"
            className="space-y-4"
          />
        </CardContent>
      </Card>

      {/* Form Features */}
      <Card>
        <CardHeader>
          <CardTitle>Form Builder Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Built-in Components</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Text, Email, Password inputs</li>
                <li>• Textarea for long content</li>
                <li>• Select dropdowns</li>
                <li>• Checkboxes and switches</li>
                <li>• File upload with drag & drop</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Advanced Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time validation with Zod</li>
                <li>• TypeScript type safety</li>
                <li>• Conditional field rendering</li>
                <li>• Multiple layout options</li>
                <li>• Toast notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}