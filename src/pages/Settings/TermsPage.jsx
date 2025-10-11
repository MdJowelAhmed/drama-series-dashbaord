import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const TermsPage = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(`
    <h2>Terms and Conditions</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>

    <h3>1. Introduction</h3>
    <p>Welcome to CineAdmin. These terms and conditions outline the rules and regulations for the use of our platform.</p>

    <h3>2. Acceptance of Terms</h3>
    <p>By accessing this platform, you accept these terms and conditions in full. Do not continue to use CineAdmin if you do not accept all of the terms and conditions stated on this page.</p>

    <h3>3. User Responsibilities</h3>
    <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

    <h3>4. Content Policy</h3>
    <p>All content uploaded to the platform must comply with applicable laws and regulations. We reserve the right to remove any content that violates our policies.</p>

    <h3>5. Subscription and Payments</h3>
    <p>Subscription fees are non-refundable unless otherwise stated. Users must maintain an active subscription to access premium features.</p>
  `);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Terms & Conditions updated successfully!');
    setLoading(false);
  };

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
        <p className="text-slate-600 mt-1">Manage your terms and conditions content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="min-h-[400px]"
            />
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsPage;
