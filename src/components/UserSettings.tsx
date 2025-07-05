
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserSettingsProps {
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  language: string;
  setLanguage: (value: string) => void;
  userName: string;
  setUserName: (value: string) => void;
}

const UserSettings = ({ 
  onClose, 
  isDarkMode, 
  setIsDarkMode, 
  language, 
  setLanguage,
  userName,
  setUserName
}: UserSettingsProps) => {
  const [profile, setProfile] = useState({
    name: userName,
    emails: ["user@example.com"],
    mobile: "+91 9876543210"
  });
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
    if (profile.emails.length > 1) {
      setProfile(prev => ({
        ...prev,
        emails: prev.emails.filter(email => email !== emailToRemove)
      }));
    }
  };

  const handleSave = () => {
    setUserName(profile.name);
    onClose();
  };

  const isEnglish = language === "english";

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEnglish ? "Settings" : "ക്രമീകരണങ്ങൾ"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? "Profile" : "പ്രൊഫൈൽ"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                {isEnglish ? "Name" : "പേര്"}
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mobile">
                {isEnglish ? "Mobile Number" : "മൊബൈൽ നമ്പർ"}
              </Label>
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
            <CardTitle className="text-lg">
              {isEnglish ? "Email Addresses" : "ഇമെയിൽ വിലാസങ്ങൾ"}
            </CardTitle>
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
                placeholder={isEnglish ? "Add new email" : "പുതിയ ഇമെയിൽ ചേർക്കുക"}
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

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? "Language" : "ഭാഷ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">
                {isEnglish ? "Select Language" : "ഭാഷ തിരഞ്ഞെടുക്കുക"}
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="malayalam">മലയാളം</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? "Appearance" : "കാഴ്ച"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">
                  {isEnglish ? "Dark Mode" : "ഡാർക്ക് മോഡ്"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isEnglish 
                    ? "Switch between light and dark theme" 
                    : "വെളിച്ചവും ഇരുണ്ടതുമായ തീമുകൾ തമ്മിൽ മാറുക"
                  }
                </p>
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
        <Button className="w-full" onClick={handleSave}>
          {isEnglish ? "Save Changes" : "മാറ്റങ്ങൾ സംരക്ഷിക്കുക"}
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
