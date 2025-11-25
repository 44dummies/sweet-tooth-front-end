import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Check, SkipForward } from "lucide-react";
import { supabase } from "@/lib/supabase";

const generateAvatars = () => {
  const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'micah', 'pixel-art'];
  const seeds = Array.from({ length: 12 }, (_, i) => `avatar-${i}`);
  
  return seeds.map((seed, index) => ({
    id: `${styles[index % styles.length]}-${seed}`,
    url: `https://api.dicebear.com/7.x/${styles[index % styles.length]}/svg?seed=${seed}`,
    style: styles[index % styles.length]
  }));
};

const ProfileSetup = () => {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const avatars = generateAvatars();

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to set up your profile');
      navigate('/login');
      return;
    }
    
    if (profile?.username) {
      navigate("/");
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!selectedAvatar && avatars.length > 0) {
      setSelectedAvatar(avatars[0].url);
    }
  }, []);

  // Skip function - navigate directly without requiring profile completion
  const handleSkip = async () => {
    setSkipping(true);
    
    try {
      // Generate a random username and set default avatar
      const randomUsername = `user_${Date.now().toString(36)}`;
      const defaultAvatar = avatars[0]?.url || '';
      
      // Try to save basic profile, but don't block navigation on failure
      try {
        await updateProfile({
          username: randomUsername,
          avatar: defaultAvatar,
        });
      } catch (err) {
        // Silently ignore - user can set up profile later
        console.log('Skip profile setup - will complete later');
      }
      
      toast.info("You can complete your profile anytime from settings");
      
      // Force navigation regardless of update success
      window.location.href = '/';
    } catch (err) {
      console.error('Skip error:', err);
      // Force navigation even on error
      window.location.href = '/';
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      let query = supabase
        .from('profiles')
        .select('username, id')
        .eq('username', username.toLowerCase());
      
      if (user?.id) {
        query = query.neq('id', user.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.error('Database table does not exist:', error);
          toast.error('Database not set up. Please run the migration SQL.');
          setUsernameAvailable(null);
        } else {
          console.error('Error checking username:', error);
          setUsernameAvailable(null);
        }
      } else if (data) {
        setUsernameAvailable(false);
      } else {
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!usernameAvailable) {
      toast.error("Username is already taken");
      return;
    }

    if (!selectedAvatar) {
      toast.error("Please select an avatar");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        username: username.toLowerCase(),
        avatar: selectedAvatar,
      });

      if (error) {
        console.error('Profile update error:', error);
        
        if (error.message && (error.message.includes('duplicate key') || error.message.includes('profiles_username_key'))) {
          toast.error("This username is already taken. Please choose another one.");
          setUsernameAvailable(false);
        } else {
          toast.error(error?.message || "Failed to setup profile");
        }
        
        setLoading(false);
        return;
      }

      toast.success("Profile setup complete!");
      
      // Use setTimeout to ensure state updates are complete before navigation
      setTimeout(() => {
        setLoading(false);
        navigate("/", { replace: true });
      }, 100);
    } catch (err) {
      console.error('Profile setup exception:', err);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <div className="w-full max-w-3xl">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>Choose a username and avatar to personalize your account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setUsername(value);
                    }}
                    className="pl-10 pr-10"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 font-medium">
                      Taken
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  3-20 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label>Choose Your Avatar</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedAvatar === avatar.url
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={`Avatar ${avatar.id}`}
                        className="w-full h-full rounded-lg object-cover"
                      />
                      {selectedAvatar === avatar.url && (
                        <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Check className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {selectedAvatar && (
                <div className="bg-secondary/30 rounded-lg p-4 flex items-center gap-4">
                  <img
                    src={selectedAvatar}
                    alt="Selected avatar"
                    className="w-16 h-16 rounded-full border-2 border-primary"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Preview</p>
                    <p className="font-semibold">
                      {username || "your_username"}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !usernameAvailable || !username || !selectedAvatar}
                className="w-full h-12 text-lg"
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>

              {/* Skip Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={skipping}
                className="w-full mt-2 text-muted-foreground hover:text-foreground"
              >
                {skipping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Skipping...
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip for now
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-1">
                You can complete your profile later from your account settings
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
