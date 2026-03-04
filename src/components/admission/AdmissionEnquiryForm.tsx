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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  User, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
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

const steps = [
  { id: 1, title: "Student Info", icon: User, fields: ["studentName", "gender", "dateOfBirth"] },
  { id: 2, title: "Parent Info", icon: Users, fields: ["parentName", "contactNumber", "email"] },
  { id: 3, title: "Academic", icon: GraduationCap, fields: ["gradeApplying", "address"] },
];

export function AdmissionEnquiryForm({ initialData, onSubmit }: AdmissionEnquiryFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const validateCurrentStep = async () => {
    const currentFields = steps[currentStep - 1].fields as (keyof FormInput)[];
    const result = await form.trigger(currentFields);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive && "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30",
                  isCompleted && "bg-emerald-500 text-white",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-500 border border-gray-200"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 font-medium",
                isActive && "text-violet-600",
                isCompleted && "text-emerald-600",
                !isActive && !isCompleted && "text-gray-400"
              )}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-16 h-0.5 mx-2 transition-all duration-300",
                isCompleted ? "bg-emerald-500" : "bg-gray-200"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {renderStepIndicator()}

        <Card className="border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* Step 1: Student Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-600" />
                  Student Information
                </h3>
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
              </div>
            )}

            {/* Step 2: Parent Info */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Parent/Guardian Information
                </h3>
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
              </div>
            )}

            {/* Step 3: Academic Info */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  Academic Information
                </h3>
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
                              // Fallback to hardcoded grades if no classes found
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "border-gray-200 text-gray-700 hover:bg-gray-100",
              currentStep === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white min-w-[150px]"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {initialData ? "Update Enquiry" : "Submit Enquiry"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
