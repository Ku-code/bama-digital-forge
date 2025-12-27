import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, MessageSquare, Clock, User, Send } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
}

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  createdBy: string;
  createdByName: string;
  createdByImage?: string;
  createdAt: string;
  comments: Comment[];
}

const STORAGE_KEY = "bamas_agenda_items";

const AgendaContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [newAgenda, setNewAgenda] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  // Load agenda items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAgendaItems(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading agenda items:", error);
      }
    }
  }, []);

  // Save agenda items to localStorage
  const saveAgendaItems = (items: AgendaItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setAgendaItems(items);
  };

  const handleCreateAgenda = () => {
    if (!newAgenda.title || !newAgenda.date || !newAgenda.time) {
      toast({
        title: t("dashboard.agenda.create.error.title") || "Validation Error",
        description: t("dashboard.agenda.create.error.description") || "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newItem: AgendaItem = {
      id: `agenda_${Date.now()}`,
      title: newAgenda.title,
      description: newAgenda.description,
      date: newAgenda.date,
      time: newAgenda.time,
      location: newAgenda.location,
      createdBy: user?.id || "",
      createdByName: user?.name || "Unknown User",
      createdByImage: user?.image,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    const updatedItems = [newItem, ...agendaItems];
    saveAgendaItems(updatedItems);

    toast({
      title: t("dashboard.agenda.create.success.title") || "Agenda Created",
      description: t("dashboard.agenda.create.success.description") || "Your agenda item has been created successfully!",
    });

    // Reset form
    setNewAgenda({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleAddComment = (agendaId: string) => {
    if (!commentText.trim()) {
      toast({
        title: t("dashboard.agenda.comment.error.title") || "Empty Comment",
        description: t("dashboard.agenda.comment.error.description") || "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user?.id || "",
      userName: user?.name || "Unknown User",
      userImage: user?.image,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedItems = agendaItems.map((item) => {
      if (item.id === agendaId) {
        return {
          ...item,
          comments: [...item.comments, newComment],
        };
      }
      return item;
    });

    saveAgendaItems(updatedItems);
    setCommentText("");
    setIsCommentDialogOpen(null);
    toast({
      title: t("dashboard.agenda.comment.success.title") || "Comment Added",
      description: t("dashboard.agenda.comment.success.description") || "Your comment has been added!",
    });
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("dashboard.agenda.title") || "Agenda & Meetings"}</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("dashboard.agenda.create.button") || "Create Agenda"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("dashboard.agenda.create.title") || "Create New Agenda Item"}</DialogTitle>
              <DialogDescription>
                {t("dashboard.agenda.create.description") || "Add a new agenda item or meeting to the schedule"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t("dashboard.agenda.create.form.title") || "Title"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={newAgenda.title}
                  onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
                  placeholder={t("dashboard.agenda.create.form.title.placeholder") || "Meeting title"}
                  className="rounded-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("dashboard.agenda.create.form.description") || "Description"}</Label>
                <Textarea
                  id="description"
                  value={newAgenda.description}
                  onChange={(e) => setNewAgenda({ ...newAgenda, description: e.target.value })}
                  placeholder={t("dashboard.agenda.create.form.description.placeholder") || "Agenda description..."}
                  className="min-h-[100px] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {t("dashboard.agenda.create.form.date") || "Date"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAgenda.date}
                    onChange={(e) => setNewAgenda({ ...newAgenda, date: e.target.value })}
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">
                    {t("dashboard.agenda.create.form.time") || "Time"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAgenda.time}
                    onChange={(e) => setNewAgenda({ ...newAgenda, time: e.target.value })}
                    className="rounded-full"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("dashboard.agenda.create.form.location") || "Location"}</Label>
                <Input
                  id="location"
                  value={newAgenda.location}
                  onChange={(e) => setNewAgenda({ ...newAgenda, location: e.target.value })}
                  placeholder={t("dashboard.agenda.create.form.location.placeholder") || "Meeting location"}
                  className="rounded-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-full">
                {t("dashboard.agenda.create.cancel") || "Cancel"}
              </Button>
              <Button onClick={handleCreateAgenda} className="rounded-full">
                {t("dashboard.agenda.create.submit") || "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {agendaItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.agenda.upcoming") || "Upcoming Meetings"}</CardTitle>
            <CardDescription>
              {t("dashboard.agenda.description") || "View and manage your meeting schedule"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t("dashboard.agenda.empty") || "No upcoming meetings scheduled."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agendaItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(item.date), "PPP")} at {item.time}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.createdByImage} alt={item.createdByName} />
                      <AvatarFallback className="text-xs">
                        {item.createdByName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{item.createdByName}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                )}
                
                {item.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">
                        {t("dashboard.agenda.comments") || "Comments"} ({item.comments.length})
                      </h4>
                      {item.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.userImage} alt={comment.userName} />
                            <AvatarFallback className="text-xs">
                              {comment.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "PPp")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Dialog open={isCommentDialogOpen === item.id} onOpenChange={(open) => setIsCommentDialogOpen(open ? item.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t("dashboard.agenda.comment.button") || "Add Comment"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("dashboard.agenda.comment.title") || "Add Comment"}</DialogTitle>
                      <DialogDescription>
                        {t("dashboard.agenda.comment.description") || "Share your thoughts about this agenda item"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="comment">{t("dashboard.agenda.comment.form.text") || "Comment"}</Label>
                        <Textarea
                          id="comment"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={t("dashboard.agenda.comment.form.text.placeholder") || "Write your comment..."}
                          className="min-h-[100px] rounded-lg"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCommentDialogOpen(null)} className="rounded-full">
                        {t("dashboard.agenda.comment.cancel") || "Cancel"}
                      </Button>
                      <Button onClick={() => handleAddComment(item.id)} className="rounded-full">
                        <Send className="mr-2 h-4 w-4" />
                        {t("dashboard.agenda.comment.submit") || "Post Comment"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgendaContent;
