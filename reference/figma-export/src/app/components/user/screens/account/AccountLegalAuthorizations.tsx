import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  FileCheck,
  Download,
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  FilePlus,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";

interface AccountLegalAuthorizationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LegalDocument {
  id: string;
  name: string;
  type: string;
  signed: boolean;
  signedDate?: string;
  lastUpdated?: string;
  canResign?: boolean;
}

interface UploadedDocument {
  id: string;
  name: string;
  fileType: string;
  fileSize: string;
  uploadedDate: string;
  category: string;
}

export function AccountLegalAuthorizations({
  open,
  onOpenChange,
}: AccountLegalAuthorizationsProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([
    {
      id: "doc_1",
      name: "Enduring Power of Attorney",
      fileType: "PDF",
      fileSize: "2.4 MB",
      uploadedDate: "2025-11-20",
      category: "Legal Documents",
    },
    {
      id: "doc_2",
      name: "Advanced Care Directive",
      fileType: "PDF",
      fileSize: "1.8 MB",
      uploadedDate: "2025-11-20",
      category: "Medical Directives",
    },
    {
      id: "doc_3",
      name: "Pet Care Instructions",
      fileType: "DOCX",
      fileSize: "156 KB",
      uploadedDate: "2025-12-01",
      category: "Pet Documents",
    },
  ]);

  const legalDocs: LegalDocument[] = [
    {
      id: "auth_1",
      name: "Property Access Authorization",
      type: "required",
      signed: true,
      signedDate: "2025-11-15",
      lastUpdated: "2025-11-15",
      canResign: true,
    },
    {
      id: "auth_2",
      name: "Pet Care Authorization",
      type: "required",
      signed: true,
      signedDate: "2025-11-15",
      lastUpdated: "2025-11-15",
      canResign: true,
    },
    {
      id: "auth_3",
      name: "Information Sharing Consent",
      type: "required",
      signed: true,
      signedDate: "2025-11-15",
      lastUpdated: "2025-11-15",
      canResign: true,
    },
    {
      id: "auth_4",
      name: "Liability Waiver",
      type: "required",
      signed: true,
      signedDate: "2025-11-15",
      lastUpdated: "2025-11-15",
      canResign: false,
    },
    {
      id: "auth_5",
      name: "Reputation Guard Authorization",
      type: "optional",
      signed: true,
      signedDate: "2025-11-15",
      lastUpdated: "2025-11-15",
      canResign: true,
    },
  ];

  const handleDeleteDoc = (id: string) => {
    setUploadedDocs(uploadedDocs.filter((doc) => doc.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              Legal Authorizations
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Manage signed authorizations and legal documents
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Info Card */}
          <Card className="p-5 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  Your Authorizations Are Current
                </p>
                <p className="text-sm text-muted-foreground">
                  All required documents are signed and up to date. You'll be
                  notified if any require re-signing due to plan changes.
                </p>
              </div>
            </div>
          </Card>

          {/* Legacy Wolf Authorizations */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Legacy Wolf Authorizations
            </h3>
            <div className="space-y-3">
              {legalDocs.map((doc) => (
                <Card key={doc.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{doc.name}</h4>
                        {doc.signed ? (
                          <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            SIGNED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            PENDING
                          </Badge>
                        )}
                        {doc.type === "required" && (
                          <Badge
                            variant="outline"
                            className="border-destructive text-destructive text-xs"
                          >
                            REQUIRED
                          </Badge>
                        )}
                      </div>
                      {doc.signed && doc.signedDate && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Signed on:{" "}
                            {new Date(doc.signedDate).toLocaleDateString(
                              "en-AU",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                          {doc.lastUpdated && doc.lastUpdated !== doc.signedDate && (
                            <p className="text-xs text-muted-foreground">
                              Last updated:{" "}
                              {new Date(doc.lastUpdated).toLocaleDateString(
                                "en-AU"
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    {doc.canResign && (
                      <Button variant="outline" size="sm">
                        Re-sign
                      </Button>
                    )}
                  </div>

                  {doc.canResign && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Re-signing required after material changes to your plan or
                      contact information
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Uploaded Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Your Legal Documents ({uploadedDocs.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadDialog(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </div>

            {uploadedDocs.length === 0 ? (
              <Card className="p-8 text-center">
                <FilePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-2">No documents uploaded yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload important legal documents like Power of Attorney,
                  Advanced Care Directives, or pet care instructions
                </p>
                <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Your First Document
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => (
                  <Card key={doc.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-muted">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate mb-1">{doc.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>{doc.fileType}</span>
                          <span>{doc.fileSize}</span>
                          <span>{doc.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Uploaded{" "}
                          {new Date(doc.uploadedDate).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Accepted formats: PDF, JPEG, PNG, DOCX • Max file size: 10MB per
              document
            </p>
          </div>

          {/* Important Information */}
          <Card className="p-5 bg-muted">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              About Your Documents
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • All documents are encrypted at rest and accessible only to
                authorized Legacy Wolf staff
              </p>
              <p>
                • Responders can only access documents relevant to an active
                incident
              </p>
              <p>
                • You can download or delete your documents at any time
              </p>
              <p>
                • Documents uploaded here are for reference only and do not
                replace legal execution
              </p>
            </div>
          </Card>

          {/* Re-sign Alert Example */}
          <Card className="p-5 bg-destructive/10 border-destructive/30 hidden">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Re-signing Required</p>
                <p className="text-sm text-muted-foreground mb-3">
                  You've made changes to your property access details.
                  Re-signing your Property Access Authorization is required to
                  keep your plan active.
                </p>
                <Button size="sm" className="gap-2">
                  <FileCheck className="w-4 h-4" />
                  Re-sign Now
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Upload Legal Document
              </DialogTitle>
              <DialogDescription>
                Upload important legal documents to keep them accessible in your
                Legacy Wolf account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input placeholder="e.g., Enduring Power of Attorney" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Legal Documents</option>
                  <option>Medical Directives</option>
                  <option>Pet Documents</option>
                  <option>Estate Planning</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this document"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPEG, PNG, or DOCX (max 10MB)
                  </p>
                  <Input type="file" className="hidden" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowUploadDialog(false)}>
                Upload Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
