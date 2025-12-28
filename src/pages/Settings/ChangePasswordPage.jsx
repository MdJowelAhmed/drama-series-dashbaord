import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useChangePasswordMutation } from "@/redux/feature/authApi";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await changePassword(data).unwrap();
      toast.success(response.message || "Password changed successfully!");
      reset();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent">Change Password</h1>
        <p className="text-accent mt-1">Update your account password</p>
      </div>

      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              {" "}
              <Button type="submit" disabled={loading} className="py-6 w-1/2">
                {loading ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
