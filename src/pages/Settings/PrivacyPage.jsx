import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGetSettingQuery, useUpdateSettingMutation } from '@/redux/feature/settingsApi';

const PrivacyPage = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState();
  const queryParams =[]
  queryParams.push({ name: "key", value: "privacyPolicy" });
  const { data, isLoading: isLoadingSetting, isError } = useGetSettingQuery(queryParams);
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  useEffect(() => {
    if (data) {
      setContent(data.data);
    }
  }, [data]);

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
