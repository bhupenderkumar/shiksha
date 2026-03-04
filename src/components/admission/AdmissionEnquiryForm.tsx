import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ProspectiveStudent, ProspectiveStudentData } from "@/types/admission";
import { classService } from "@/services/classService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  section: string;
}

export interface AdmissionEnquiryFormProps {
  initialData?: ProspectiveStudent | null;
  onSubmit: (data: ProspectiveStudentData) => Promise<void>;
}

const formSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  parentName: z.string().min(2, "Parent name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  gradeApplying: z.string().min(1, "Please select a grade"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().min(1, "Please select date of birth").transform(str => new Date(str)),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type FormInput = z.input<typeof formSchema>;

export function AdmissionEnquiryForm({ initialData, onSubmit }: AdmissionEnquiryFormProps) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAllClasses();
        setClasses(data?.map(c => ({ id: c.id, name: c.name, section: c.section })) || []);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: initialData?.studentName || "",
      parentName: initialData?.parentName || "",
      dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.toISOString().split("T")[0] : "",
      gender: (initialData?.gender as "Male" | "Female" | "Other") || "Male",
      email: initialData?.email || "",
      contactNumber: initialData?.contactNumber || "",
      gradeApplying: initialData?.gradeApplying || "",
      address: initialData?.address || "",
    },
  });

  const handleSubmit = async (data: FormInput) => {
    const formattedData: ProspectiveStudentData = {
      studentName: data.studentName,
      parentName: data.parentName,
      dateOfBirth: new Date(data.dateOfBirth),
      gradeApplying: data.gradeApplying,
      contactNumber: data.contactNumber,
      email: data.email,
      gender: data.gender,
      address: data.address,
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Student Information */}
        <Card className="border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-600" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Student Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          placeholder="Enter student's full name" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-100 border-gray-200">
                        <SelectItem value="Male" className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200">Male</SelectItem>
                        <SelectItem value="Female" className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200">Female</SelectItem>
                        <SelectItem value="Other" className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-gray-700">Date of Birth</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...field}
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parent/Guardian Information */}
        <Card className="border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Parent/Guardian Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          placeholder="Enter parent's name" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Contact Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          placeholder="Enter 10-digit mobile number" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-gray-700">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Enter email address" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet-600" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="gradeApplying"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Grade Applying For</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900">
                          {loadingClasses ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Loading grades...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select grade" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-100 border-gray-200 max-h-60">
                        {classes.length > 0 ? (
                          classes.map((cls) => (
                            <SelectItem 
                              key={cls.id} 
                              value={cls.name}
                              className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-violet-600" />
                                {cls.name} {cls.section && `- Section ${cls.section}`}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5"].map((grade) => (
                            <SelectItem 
                              key={grade} 
                              value={grade}
                              className="text-gray-900 hover:bg-gray-200 focus:bg-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-violet-600" />
                                {grade === "Nursery" || grade === "LKG" || grade === "UKG" ? grade : `Grade ${grade}`}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          placeholder="Enter complete address" 
                          className="pl-10 bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white min-w-[200px]"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {initialData ? "Update Enquiry" : "Submit & Proceed to Test"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
