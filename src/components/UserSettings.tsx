
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserSettingsProps {
  onClose: () => void;
}

const UserSettings = ({ onClose }: UserSettingsProps) => {
  const [profile, setProfile] = useState({
    name: "User",
    emails: ["user@example.com"],
    mobile: "+91 9876543210"
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const addEmail = () => {
    if (newEmail && !profile.emails.includes(newEmail)) {
      setProfile(prev => ({
        ...prev,
        emails: [...prev.emails, newEmail]
      }));
      setNewEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email !== emailToRemove)
    }));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={profile.mobile}
              onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.emails.map((email, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm">{email}</span>
              {profile.emails.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmail(email)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmail()}
            />
            <Button onClick={addEmail} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="w-full" onClick={onClose}>
        Save Changes
      </Button>
    </div>
  );
};

export default UserSettings;
