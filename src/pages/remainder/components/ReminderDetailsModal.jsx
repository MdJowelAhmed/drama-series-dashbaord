import { Calendar, Clock } from "lucide-react";
import { getImageUrl } from "@/components/share/imageUrl";
import { formatDateTime } from "../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ReminderDetailsModal = ({ reminder, onClose }) => {
  if (!reminder) return null;

  return (
    <Dialog open={!!reminder} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            Reminder Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thumbnail */}
          {reminder.thumbnail && (
            <div className="h-80 w-full overflow-hidden bg-gray-100 rounded-lg">
              <img
                src={getImageUrl(reminder.thumbnail)}
                alt={reminder.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Name and Status */}
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-accent">{reminder.name}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                reminder.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {reminder.status}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-accent leading-relaxed">{reminder.description}</p>
          </div>

          {/* Reminder Time */}
          <div className="space-y-3 border-t border-white/20 pt-4">
            <div className="flex items-center gap-2 text-accent">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                Reminder Time: {formatDateTime(reminder.reminderTime)}
              </span>
            </div>
            {reminder.createdAt && (
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Created: {formatDateTime(reminder.createdAt)}
                </span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDetailsModal;
