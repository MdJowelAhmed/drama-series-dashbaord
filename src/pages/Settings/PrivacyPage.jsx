import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PrivacyPage = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(`
    <h2>Privacy Policy</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>

    <h3>1. Information We Collect</h3>
    <p>We collect information that you provide directly to us, including name, email address, phone number, and payment information.</p>

    <h3>2. How We Use Your Information</h3>
    <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

    <h3>3. Data Security</h3>
    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.</p>

    <h3>4. Cookies and Tracking</h3>
    <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve user experience.</p>

    <h3>5. Third-Party Services</h3>
    <p>We may employ third-party companies and individuals to facilitate our service. These third parties have access to your personal information only to perform tasks on our behalf.</p>

    <h3>6. Your Rights</h3>
    <p>You have the right to access, update, or delete your personal information at any time by contacting us.</p>
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
    toast.success('Privacy Policy updated successfully!');
    setLoading(false);
  };

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent">Privacy Policy</h1>
        <p className="text-accent mt-1">Manage your privacy policy content</p>
      </div>

      <Card className="bg-secondary ">
        <CardHeader>
          <CardTitle>Content Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white text-black rounded-lg">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="min-h-[400px]"
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="py-6 w-1/5">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPage;
