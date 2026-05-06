import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTenantIdFromClerkUserId } from "@/lib/clerk";
import { getDocuments, deleteDocument } from "@/services/documentService";
import { BGFileUpload } from "@/components/dashboard/file-upload";
import { formatFileSize } from "@/lib/format";

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenantId = await getTenantIdFromClerkUserId(userId);
  if (!tenantId) redirect("/sign-in");

  const documents = await getDocuments(tenantId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload documents to train your chatbot. Supported formats: PDF, TXT, MD.
          </p>
        </div>
        <BGFileUpload tenantId={tenantId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No documents uploaded yet. Upload your first document to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.file_size)} • Uploaded{" "}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        doc.ingestion_status === "completed"
                          ? "default"
                          : doc.ingestion_status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {doc.ingestion_status}
                    </Badge>
                    {doc.ingestion_status === "processing" && (
                      <Progress value={50} className="w-24" />
                    )}
                    <form
                      action={async () => {
                        "use server";
                        await deleteDocument(tenantId, doc.id);
                      }}
                    >
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
