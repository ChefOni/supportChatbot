"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Paintbrush, 
  MessageSquare, 
  Palette, 
  Eye,
  Save
} from "lucide-react";

export default function CustomizationPage() {
  const [settings, setSettings] = useState({
    chatbot_name: "Support Bot",
    greeting_text: "Hi! How can I help you today?",
    placeholder_text: "Type your message...",
    primary_color: "#3B82F6",
    logo_url: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  async function saveSettings() {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Settings saved",
        description: "Your chatbot customization has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customization</h1>
          <p className="text-muted-foreground">
            Customize your chatbot's appearance and behavior.
          </p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chatbot_name">Chatbot Name</Label>
                <Input
                  id="chatbot_name"
                  value={settings.chatbot_name}
                  onChange={(e) =>
                    setSettings({ ...settings, chatbot_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="greeting_text">Greeting Message</Label>
                <Input
                  id="greeting_text"
                  value={settings.greeting_text}
                  onChange={(e) =>
                    setSettings({ ...settings, greeting_text: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeholder_text">Input Placeholder</Label>
                <Input
                  id="placeholder_text"
                  value={settings.placeholder_text}
                  onChange={(e) =>
                    setSettings({ ...settings, placeholder_text: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) =>
                      setSettings({ ...settings, primary_color: e.target.value })
                    }
                    className="w-16"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) =>
                      setSettings({ ...settings, primary_color: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL (optional)</Label>
                <Input
                  id="logo_url"
                  value={settings.logo_url}
                  onChange={(e) =>
                    setSettings({ ...settings, logo_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-background">
                {/* Widget Header */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <div className="flex items-center gap-2">
                    {settings.logo_url && (
                      <img
                        src={settings.logo_url}
                        alt="Logo"
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span className="font-bold">{settings.chatbot_name}</span>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="p-4 space-y-3 h-64 overflow-y-auto">
                  <div className="flex gap-2">
                    <div
                      className="rounded-lg p-3 text-sm max-w-[80%]"
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#111827",
                      }}
                    >
                      {settings.greeting_text}
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      disabled
                      placeholder={settings.placeholder_text}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      style={{ backgroundColor: settings.primary_color }}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
