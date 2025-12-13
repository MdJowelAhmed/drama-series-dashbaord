import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useGetSettingQuery, useUpdateSettingMutation } from '@/redux/feature/settingsApi';

const TermsPage = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState();
  const queryParams =[]
  queryParams.push({ name: "key", value: "userAgreement" });
  const { data, isLoading: isLoadingSetting, isError } = useGetSettingQuery(queryParams);
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();
  console.log(data);

  useEffect(() => {
    if (data) {
      setContent(data);
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
    try {
      const response = await updateSetting({userAgreement: content }).unwrap();
      toast.success(response.message || "User Agreement updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update User Agreement");
    }
  };

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent">User Agreement</h1>
        <p className="text-accent mt-1">Manage your user agreement content</p>
      </div>

      <Card className="bg-secondary">
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
              className="min-h-[400px] rounded-2xl"
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

export default TermsPage;
