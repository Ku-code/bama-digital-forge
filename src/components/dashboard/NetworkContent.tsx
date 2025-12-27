import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, User, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logHistory } from "@/lib/history";
import { Users, Plus, Check, X, Mail, Phone, MapPin, Globe, UserCheck, UserX, Clock } from "lucide-react";
import { format } from "date-fns";

const STORAGE_KEY = "bamas_members";

const NetworkContent = () => {
  const { t } = useLanguage();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [rejectMemberId, setRejectMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "member" as UserRole,
  });

  // Load members from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const loadedMembers = JSON.parse(stored);
        setMembers(loadedMembers);
      } catch (error) {
        console.error("Error loading members:", error);
      }
    }
  }, []);

  // Save members to localStorage
  const saveMembers = (updatedMembers: User[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMembers));
    setMembers(updatedMembers);
    
    // Update current user if they're in the list
    const currentUser = updatedMembers.find(m => m.id === user?.id);
    if (currentUser && user) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  };

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      toast({
        title: t("dashboard.network.add.error.title") || "Validation Error",
        description: t("dashboard.network.add.error.required") || "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    const emailExists = members.some(m => m.email.toLowerCase() === newMember.email.toLowerCase());
    if (emailExists) {
      toast({
        title: t("dashboard.network.add.error.title") || "Validation Error",
        description: t("dashboard.network.add.error.emailExists") || "A member with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    const memberData: User = {
      id: `member_${Date.now()}`,
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      phone: newMember.phone.trim() || undefined,
      role: newMember.role,
      status: 'approved',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: user?.id,
    };

    const updatedMembers = [...members, memberData];
    saveMembers(updatedMembers);

    // Log history
    if (user) {
      logHistory(
        "network",
        "Added member",
        `Added member "${memberData.name}"`,
        user.id,
        user.name,
        user.image,
        { memberId: memberData.id, memberEmail: memberData.email }
      );
    }

    toast({
      title: t("dashboard.network.add.success.title") || "Member Added",
      description: t("dashboard.network.add.success.description") || "Member has been added successfully!",
    });

    // Reset form
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "member",
    });
    setIsAddDialogOpen(false);
  };

  const handleApproveMember = (memberId: string) => {
    const updatedMembers = members.map((member) => {
      if (member.id === memberId) {
        return {
          ...member,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
          approvedBy: user?.id,
        };
      }
      return member;
    });

    saveMembers(updatedMembers);

    const approvedMember = members.find(m => m.id === memberId);
    if (approvedMember && user) {
      logHistory(
        "network",
        "Approved member",
        `Approved member "${approvedMember.name}"`,
        user.id,
        user.name,
        user.image,
        { memberId: approvedMember.id }
      );
    }

    toast({
      title: t("dashboard.network.approve.success.title") || "Member Approved",
      description: t("dashboard.network.approve.success.description") || "Member has been approved successfully!",
    });
  };

  const handleRejectMember = (memberId: string) => {
    const rejectedMember = members.find(m => m.id === memberId);
    const updatedMembers = members.filter((m) => m.id !== memberId);
    saveMembers(updatedMembers);
    setRejectMemberId(null);

    if (rejectedMember && user) {
      logHistory(
        "network",
        "Rejected member",
        `Rejected member "${rejectedMember.name}"`,
        user.id,
        user.name,
        user.image,
        { memberId: rejectedMember.id }
      );
    }

    toast({
      title: t("dashboard.network.reject.success.title") || "Member Rejected",
      description: t("dashboard.network.reject.success.description") || "Member request has been rejected.",
    });
  };

  const handleUpdateMemberRole = (memberId: string, newRole: UserRole) => {
    // Prevent changing superadmin role
    const member = members.find(m => m.id === memberId);
    if (member?.role === 'superadmin' && !isSuperAdmin) {
      toast({
        title: t("dashboard.network.role.error.title") || "Permission Denied",
        description: t("dashboard.network.role.error.superadmin") || "You cannot change superadmin role.",
        variant: "destructive",
      });
      return;
    }

    const updatedMembers = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, role: newRole };
      }
      return m;
    });

    saveMembers(updatedMembers);

    const updatedMember = updatedMembers.find(m => m.id === memberId);
    if (updatedMember && user) {
      logHistory(
        "network",
        "Updated member role",
        `Updated role of "${updatedMember.name}" to ${newRole}`,
        user.id,
        user.name,
        user.image,
        { memberId: updatedMember.id, newRole }
      );
    }

    toast({
      title: t("dashboard.network.role.success.title") || "Role Updated",
      description: t("dashboard.network.role.success.description") || "Member role has been updated successfully!",
    });
  };

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');
  const rejectedMembers = members.filter(m => m.status === 'rejected');

  const getRoleBadgeVariant = (role?: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("dashboard.network.title") || "Network"}</h2>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.network.add.button") || "Add Member"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("dashboard.network.add.title") || "Add New Member"}</DialogTitle>
                <DialogDescription>
                  {t("dashboard.network.add.description") || "Add a new member to the network"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">
                    {t("dashboard.network.add.form.name") || "Full Name"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder={t("dashboard.network.add.form.name.placeholder") || "Enter full name"}
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">
                    {t("dashboard.network.add.form.email") || "Email"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder={t("dashboard.network.add.form.email.placeholder") || "Enter email address"}
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-phone">{t("dashboard.network.add.form.phone") || "Phone"}</Label>
                  <Input
                    id="member-phone"
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder={t("dashboard.network.add.form.phone.placeholder") || "Enter phone number (optional)"}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">{t("dashboard.network.add.form.role") || "Role"}</Label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value as UserRole })}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">{t("dashboard.network.role.member") || "Member"}</SelectItem>
                      {isSuperAdmin && <SelectItem value="admin">{t("dashboard.network.role.admin") || "Admin"}</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-full">
                  {t("dashboard.network.add.cancel") || "Cancel"}
                </Button>
                <Button onClick={handleAddMember} className="rounded-full">
                  {t("dashboard.network.add.submit") || "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList className="rounded-full">
          <TabsTrigger value="approved" className="rounded-full">
            {t("dashboard.network.tabs.approved") || "Approved"} ({approvedMembers.length})
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="pending" className="rounded-full">
                {t("dashboard.network.tabs.pending") || "Pending"} ({pendingMembers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-full">
                {t("dashboard.network.tabs.rejected") || "Rejected"} ({rejectedMembers.length})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.network.approved.title") || "Approved Members"}</CardTitle>
              <CardDescription>
                {t("dashboard.network.approved.description") || "Members with full access to the platform"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t("dashboard.network.approved.empty") || "No approved members yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dashboard.network.table.name") || "Name"}</TableHead>
                        <TableHead>{t("dashboard.network.table.email") || "Email"}</TableHead>
                        <TableHead>{t("dashboard.network.table.phone") || "Phone"}</TableHead>
                        <TableHead>{t("dashboard.network.table.role") || "Role"}</TableHead>
                        <TableHead>{t("dashboard.network.table.status") || "Status"}</TableHead>
                        {isAdmin && <TableHead>{t("dashboard.network.table.actions") || "Actions"}</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.image} alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {member.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {member.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="rounded-full">
                              {member.role === 'superadmin' 
                                ? t("dashboard.network.role.superadmin") || "Super Admin"
                                : member.role === 'admin'
                                ? t("dashboard.network.role.admin") || "Admin"
                                : t("dashboard.network.role.member") || "Member"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(member.status)} className="rounded-full">
                              {member.status === 'approved' 
                                ? t("dashboard.network.status.approved") || "Approved"
                                : member.status === 'pending'
                                ? t("dashboard.network.status.pending") || "Pending"
                                : t("dashboard.network.status.rejected") || "Rejected"}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Select
                                value={member.role || 'member'}
                                onValueChange={(value) => handleUpdateMemberRole(member.id, value as UserRole)}
                                disabled={member.role === 'superadmin' && !isSuperAdmin}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs rounded-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">{t("dashboard.network.role.member") || "Member"}</SelectItem>
                                  <SelectItem value="admin">{t("dashboard.network.role.admin") || "Admin"}</SelectItem>
                                  {isSuperAdmin && <SelectItem value="superadmin">{t("dashboard.network.role.superadmin") || "Super Admin"}</SelectItem>}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.network.pending.title") || "Pending Requests"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.network.pending.description") || "Members waiting for approval to join BAMAS"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t("dashboard.network.pending.empty") || "No pending requests at the moment."}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("dashboard.network.table.name") || "Name"}</TableHead>
                            <TableHead>{t("dashboard.network.table.email") || "Email"}</TableHead>
                            <TableHead>{t("dashboard.network.table.phone") || "Phone"}</TableHead>
                            <TableHead>{t("dashboard.network.table.requested") || "Requested"}</TableHead>
                            <TableHead>{t("dashboard.network.table.actions") || "Actions"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.image} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{member.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {member.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                {member.phone ? (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    {member.phone}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {member.createdAt ? (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(member.createdAt), "PPp")}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveMember(member.id)}
                                    className="rounded-full"
                                  >
                                    <Check className="mr-1 h-3 w-3" />
                                    {t("dashboard.network.approve.button") || "Approve"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setRejectMemberId(member.id)}
                                    className="rounded-full"
                                  >
                                    <X className="mr-1 h-3 w-3" />
                                    {t("dashboard.network.reject.button") || "Reject"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.network.rejected.title") || "Rejected Members"}</CardTitle>
                  <CardDescription>
                    {t("dashboard.network.rejected.description") || "Members whose requests were rejected"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rejectedMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t("dashboard.network.rejected.empty") || "No rejected members."}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("dashboard.network.table.name") || "Name"}</TableHead>
                            <TableHead>{t("dashboard.network.table.email") || "Email"}</TableHead>
                            <TableHead>{t("dashboard.network.table.phone") || "Phone"}</TableHead>
                            <TableHead>{t("dashboard.network.table.actions") || "Actions"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rejectedMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.image} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{member.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {member.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                {member.phone ? (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    {member.phone}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveMember(member.id)}
                                  className="rounded-full"
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  {t("dashboard.network.approve.button") || "Approve"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectMemberId !== null} onOpenChange={(open) => !open && setRejectMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.network.reject.confirm.title") || "Reject Member?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.network.reject.confirm.description") || "Are you sure you want to reject this member request? They can be approved later if needed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("dashboard.network.reject.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectMemberId && handleRejectMember(rejectMemberId)}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("dashboard.network.reject.confirm.button") || "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NetworkContent;
