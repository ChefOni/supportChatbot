import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTenantIdFromClerkUserId } from "@/lib/clerk";
import { getApiKeys, createApiKey, revokeApiKey } from "@/services/apiKeyService";
import { Key, Plus, Copy, Trash2, Check } from "lucide-react";
import { useState } from "react";

export default async function ApiKeysPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenantId = await getTenantIdFromClerkUserId(userId);
  if (!tenantId) redirect("/sign-in");

  const apiKeys = await getApiKeys(tenantId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for authenticating requests to your chatbot.
          </p>
        </div>
        <CreateApiKeyDialog tenantId={tenantId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{key.name}</span>
                      <Badge variant="outline">{key.key_prefix}...</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {key.last_used_at
                        ? `Last used: ${new Date(key.last_used_at).toLocaleDateString()}`
                        : "Never used"}
                      {key.expires_at && (
                        <span className="ml-4">
                          Expires: {new Date(key.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await revokeApiKey(tenantId, key.id);
                    }}
                  >
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateApiKeyDialog({ tenantId }: { tenantId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData: FormData) => {
            "use server";
            const name = formData.get("name") as string;
            const { apiKey } = await createApiKey(tenantId, null, name);
            // In production, show the key once and store it securely
            console.log("New API Key (show only once):", apiKey);
          }}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input id="name" name="name" placeholder="Production API Key" required />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
