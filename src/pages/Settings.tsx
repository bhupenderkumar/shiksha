import { useEffect, useState } from 'react';
import { useAsync } from '@/hooks/use-async';
import { settingsService } from '@/services/settings.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/FileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfileAccess } from '@/services/profileService';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { Edit2, Save, X, School, Bell, Palette, Shield, User } from 'lucide-react';
import type { SchoolSettings, NotificationSettings, ThemeSettings, SecuritySettings } from '@/types/settings';
import { supabase } from '@/lib/api-client';
import { PageAnimation, CardAnimation } from '@/components/ui/page-animation';
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/animated-text";

export default function SettingsPage() {
  const { profile, loading: profileLoading } = useProfileAccess();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    reminderFrequency: 'daily'
  });
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'medium'
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: '30'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const { loading, execute: fetchSettings } = useAsync(
    async () => {
      if (!profile) return;
      
      // Fetch school settings
      const { data: schoolData, error: schoolError } = await supabase
        .schema('school')
        .from('Settings')
        .select('*')
        .single();

      if (schoolError) throw schoolError;
      setSettings(schoolData);

      // Fetch user settings
      const userSettings = await settingsService.getUserSettings(profile.id);
      setNotificationSettings(userSettings.notifications || notificationSettings);
      setThemeSettings(userSettings.theme || themeSettings);
      setSecuritySettings(userSettings.security || securitySettings);
    },
    { showErrorToast: true }
  );

  const { execute: updateSettings } = useAsync(
    async (data: Partial<SchoolSettings>) => {
      try {
        await settingsService.updateSchoolSettings(data);
        toast.success('School settings updated successfully');
      } catch (error) {
        console.error("Failed to update settings:", error);
        toast.error('Failed to update settings');
      }
    },
    { showErrorToast: true }
  );

  const { execute: updateUserSettings } = useAsync(
    async (settingsToUpdate: any) => {
      if (!profile) return;

      try {
        await settingsService.updateUserSettings(profile.id, settingsToUpdate);
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    },
    { showErrorToast: true }
  );

  const { execute: updateAvatar } = useAsync(
    async (file: File) => {
      if (!profile) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${profile.id}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update profile
      const { error: updateError } = await supabase
        .schema('school')
        .from('Profile')
        .update({ avatar_url: filePath })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully');
      setAvatar(null);
    },
    { showErrorToast: true }
  );

  useEffect(() => {
    if (!profileLoading) {
      fetchSettings();
    }
  }, [profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    await updateSettings({
      school_name: formData.get('school_name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string
    });
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const settingsToUpdate = {
      notifications: {
        emailNotifications: formData.get('emailNotifications') === 'true',
        pushNotifications: formData.get('pushNotifications') === 'true',
        reminderFrequency: formData.get('reminderFrequency') as string,
      },
      theme: {
        theme: formData.get('theme') as string,
        colorScheme: formData.get('colorScheme') as string,
        fontSize: formData.get('fontSize') as string,
      },
      security: {
        twoFactorAuth: formData.get('twoFactorAuth') === 'true',
        sessionTimeout: formData.get('sessionTimeout') as string,
      },
    };

    try {
      // Call the updateUserSettings method from the service
      await settingsService.updateUserSettings(profile.id, settingsToUpdate);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message; // For most browsers
        return message; // For some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userSettings = await settingsService.getUserSettings(profile?.id);
        setNotificationSettings(userSettings.notifications || notificationSettings);
        setThemeSettings(userSettings.theme || themeSettings);
        setSecuritySettings(userSettings.security || securitySettings);
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    fetchUserSettings();
  }, [profile?.id]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const settingsSections = [
    { icon: User, title: "Account", description: "Manage your account settings and preferences" },
    { icon: Bell, title: "Notifications", description: "Configure how you receive notifications" },
    { icon: Shield, title: "Privacy", description: "Control your privacy settings" },
    { icon: Palette, title: "Appearance", description: "Customize the look and feel" },
  ];

  return (
    <PageAnimation>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <School className="w-8 h-8 text-primary" />
          </motion.div>
          <AnimatedText
            text="Settings"
            className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
            variant="slideUp"
          />
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/50">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <School className="w-4 h-4" />
              School
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <CardAnimation delay={100}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your profile information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <User className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <FileUploader
                        accept="image/*"
                        onUpload={updateAvatar}
                        currentFile={profile?.avatar_url}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={profile?.name || ''}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profile?.email || ''}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardAnimation>
          </TabsContent>

          <TabsContent value="school" className="space-y-6">
            <CardAnimation delay={100}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        School Information
                      </CardTitle>
                      <CardDescription>
                        Manage your school's general information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "destructive" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="school_name">School Name</Label>
                          <Input
                            id="school_name"
                            name="school_name"
                            defaultValue={settings?.school_name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={settings?.phone}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          defaultValue={settings?.address}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={settings?.email}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            defaultValue={settings?.website}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={settings?.description}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-muted-foreground">School Name</Label>
                          <p className="text-lg font-medium">{settings?.school_name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="text-lg font-medium">{settings?.phone}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Address</Label>
                        <p className="text-lg font-medium">{settings?.address}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="text-lg font-medium">{settings?.email}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Website</Label>
                          <p className="text-lg font-medium">{settings?.website}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="text-lg font-medium">{settings?.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardAnimation>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <CardAnimation delay={100}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSettingsUpdate}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationSettings(prev => ({
                            ...prev,
                            emailNotifications: checked
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <Input type="hidden" name="emailNotifications" value={notificationSettings.emailNotifications.toString()} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your device
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationSettings(prev => ({
                            ...prev,
                            pushNotifications: checked
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <Input type="hidden" name="pushNotifications" value={notificationSettings.pushNotifications.toString()} />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Reminder Frequency</Label>
                      <Select
                        value={notificationSettings.reminderFrequency}
                        onValueChange={(value) => {
                          setNotificationSettings(prev => ({
                            ...prev,
                            reminderFrequency: value
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="hidden" name="reminderFrequency" value={notificationSettings.reminderFrequency} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </CardAnimation>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <CardAnimation delay={100}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSettingsUpdate}>
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={themeSettings.theme}
                        onValueChange={(value) => {
                          setThemeSettings(prev => ({
                            ...prev,
                            theme: value
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="hidden" name="theme" value={themeSettings.theme} />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Color Scheme</Label>
                      <Select
                        value={themeSettings.colorScheme}
                        onValueChange={(value) => {
                          setThemeSettings(prev => ({
                            ...prev,
                            colorScheme: value
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="hidden" name="colorScheme" value={themeSettings.colorScheme} />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select
                        value={themeSettings.fontSize}
                        onValueChange={(value) => {
                          setThemeSettings(prev => ({
                            ...prev,
                            fontSize: value
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="hidden" name="fontSize" value={themeSettings.fontSize} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </CardAnimation>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <CardAnimation delay={100}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSettingsUpdate}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => {
                          setSecuritySettings(prev => ({
                            ...prev,
                            twoFactorAuth: checked
                          }));
                          setUnsavedChanges(true);
                        }}
                      />
                      <Input type="hidden" name="twoFactorAuth" value={securitySettings.twoFactorAuth.toString()} />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Session Timeout</Label>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onValueChange={(value) => {
                          setSecuritySettings(prev => ({
                            ...prev,
                            sessionTimeout: value
                          }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="hidden" name="sessionTimeout" value={securitySettings.sessionTimeout} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </CardAnimation>
          </TabsContent>
        </Tabs>
      </div>
    </PageAnimation>
  );
}