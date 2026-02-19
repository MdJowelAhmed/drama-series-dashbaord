import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateFaqMutation,
  useUpdateFaqMutation,
} from "@/redux/feature/faqApi";
import { toast } from "sonner";

const FaqModal = ({ open, onOpenChange, editingFaq, onSuccess }) => {
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  useEffect(() => {
    if (editingFaq) {
      setFormData({
        question: editingFaq.question || "",
        answer: editingFaq.answer || "",
      });
    } else {
      setFormData({
        question: "",
        answer: "",
      });
    }
  }, [editingFaq, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
      };

      if (editingFaq) {
        await updateFaq({
          id: editingFaq._id,
          updatedData: payload,
        }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await createFaq(payload).unwrap();
        toast.success("FAQ created successfully");
      }

      onOpenChange(false);
      setFormData({
        question: "",
        answer: "",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingFaq ? "Edit FAQ" : "Add New FAQ"}
          </DialogTitle>
          <DialogDescription>
            {editingFaq
              ? "Update the FAQ question and answer."
              : "Create a new frequently asked question."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              name="question"
              placeholder="Enter the question"
              value={formData.question}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              name="answer"
              placeholder="Enter the answer"
              value={formData.answer}
              onChange={handleChange}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : editingFaq ? (
              "Update FAQ"
            ) : (
              "Create FAQ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaqModal;
