import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetAllFaqQuery, useDeleteFaqMutation } from "@/redux/feature/faqApi";
import { toast } from "sonner";
import FaqModal from "@/components/share/FaqModal";
import DeleteConfirmationModal from "@/components/share/DeleteConfirmationModal";

const FaqSection = () => {
  const { data: faqData, isLoading } = useGetAllFaqQuery();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const faqs = faqData?.data || [];
  
  // Get first FAQ ID for default open state
  const defaultOpenValue = useMemo(() => {
    return faqs.length > 0 ? faqs[0]._id : undefined;
  }, [faqs]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (faq) => {
    setFaqToDelete(faq);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;
    try {
      await deleteFaq(faqToDelete._id).unwrap();
      toast.success("FAQ deleted successfully");
      setDeleteModalOpen(false);
      setFaqToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete FAQ");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">FAQ Management</h1>
            <p className="">Manage frequently asked questions and answers</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2 py-6">
            <Plus className="w-4 h-4" />
            Add New FAQ
          </Button>
        </div>

        <div className="bg-white/30 backdrop-blur-lg rounded-xl shadow-sm border border-slate-200/50 overflow-hidden">
          {faqs.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500 text-lg">
                No FAQs yet. Add your first FAQ!
              </p>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              defaultValue={defaultOpenValue}
            >
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={faq._id} 
                  value={faq._id} 
                  className="border-b border-slate-200/50 last:border-b-0 data-[state=open]:border-slate-200/50 data-[state=open]:border-b px-6 transition-all mr-10"
                >
                  <div className="relative flex items-center">
                  <AccordionTrigger
  className="flex-1 text-left hover:no-underline py-4 px-0 pr-16 group cursor-pointer
  border-none focus:outline-none focus:ring-0 data-[state=open]:border-none"
>

                      <h2 className="text-base font-medium text-white  transition-colors">
                        {faq.question}
                      </h2>
                    </AccordionTrigger>
                    <div 
                      className="absolute right-0 flex gap-1 shrink-0 z-10 "
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(faq);
                        }}
                        className="h-8 w-8 hover:bg-slate-100"
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(faq);
                        }}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="text-white pb-6 pt-0 px-0 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <FaqModal
          open={isModalOpen}
          onOpenChange={handleModalClose}
          editingFaq={editingFaq}
        />

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          itemName={faqToDelete?.question}
          title="Delete FAQ"
          description={`Are you sure you want to delete "${faqToDelete?.question}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default FaqSection;
