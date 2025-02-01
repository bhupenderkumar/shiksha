import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

export interface AdmissionEnquiryFormProps {
  initialData?: ProspectiveStudent | null;
  onSubmit: (data: ProspectiveStudentData) => Promise<void>;
}

const formSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  parentName: z.string().min(2, "Parent name must be at least 2 characters"),
  email: z.string().email(),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  gradeApplying: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().transform(str => new Date(str)),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type FormInput = z.input<typeof formSchema>;

export function AdmissionEnquiryForm({ initialData, onSubmit }: AdmissionEnquiryFormProps) {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: initialData?.studentName || "",
      parentName: initialData?.parentName || "",
      dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.toISOString().split("T")[0] : "",
      gender: initialData?.gender || "Male",
      email: initialData?.email || "",
      contactNumber: initialData?.contactNumber || "",
      gradeApplying: initialData?.gradeApplying || "",
      address: initialData?.address || "",
    },
  });

  const handleSubmit = async (data: FormInput) => {
    const formattedData: ProspectiveStudentData = {
      studentname: data.studentName,
      parentname: data.parentName,
      dateofbirth: new Date(data.dateOfBirth),
      gradeapplying: data.gradeApplying,
      contactnumber: data.contactNumber,
      email: data.email,
      gender: data.gender,
      address: data.address,
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Name */}
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter student name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent Name */}
          <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter parent name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Number */}
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter contact number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grade Applying */}
          <FormField
            control={form.control}
            name="gradeApplying"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Applying For</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : initialData ? "Update Enquiry" : "Submit Enquiry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
