import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';
import { User as UserType } from '@/types';

interface ApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'approve' | 'reject' | null;
  comment: string;
  setComment: (comment: string) => void;
  approverId: string;
  setApproverId: (id: string) => void;
  onConfirm: () => void;
  approvers: UserType[];
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onOpenChange,
  actionType,
  comment,
  setComment,
  approverId,
  setApproverId,
  onConfirm,
  approvers,
}) => {
  const isApprove = actionType === 'approve';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full mx-4 bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header with colored background */}
        <div className={`px-6 py-5 ${isApprove ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
              {isApprove ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              {isApprove ? 'Approve Requisition' : 'Reject Requisition'}
            </DialogTitle>
            <DialogDescription className="text-green-50 text-base mt-2">
              {isApprove 
                ? 'Confirm approval of this purchase requisition and provide any additional comments.'
                : 'Please provide a detailed reason for rejecting this requisition.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Approver Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="h-4 w-4 text-gray-500" />
              Select Approver
            </label>
            <Select value={approverId} onValueChange={setApproverId}>
              <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                <SelectValue placeholder="Choose an approver..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-2 border-gray-200 shadow-lg">
                {approvers.map(user => (
                  <SelectItem 
                    key={user.id} 
                    value={user.id}
                    className="py-3 px-4 hover:bg-gray-50 focus:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Comment Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              {isApprove ? 'Comments (Optional)' : 'Reason for Rejection'}
              {!isApprove && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isApprove 
                ? 'Add any approval comments or special instructions...' 
                : 'Please provide a detailed reason for rejecting this requisition...'
              }
              className="w-full min-h-[100px] px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400 transition-all duration-200"
              rows={4}
            />
            {!isApprove && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="text-amber-500">ℹ</span>
                A detailed reason helps improve future requisition processes
              </p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={!isApprove && !comment.trim()}
              className={`flex-1 sm:flex-initial px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                isApprove 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
              }`}
            >
              {isApprove ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve Requisition
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject Requisition
                </div>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
