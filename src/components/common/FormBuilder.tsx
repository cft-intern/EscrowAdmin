import React from 'react';
import { useForm, Controller, FieldValues, Path, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Calendar, 
  Upload,
  Check,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/common/FileUpload';
import { cn } from '@/utils';

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'switch' 
  | 'radio' 
  | 'date' 
  | 'file'
  | 'custom';

export interface Option {
  label: string;
  value: string | number;
}

export interface FieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Option[];
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  render?: (field: any, fieldState: any) => React.ReactNode;
  validation?: z.ZodTypeAny;
  conditional?: {
    field: Path<T>;
    value: any;
    operator?: 'equals' | 'not_equals' | 'includes' | 'not_includes';
  };
}

export interface FormConfig<T extends FieldValues> {
  fields: FieldConfig<T>[];
  defaultValues?: DefaultValues<T>;
  validation?: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: 1 | 2 | 3 | 4;
}

function PasswordField({ field, placeholder }: { field: any; placeholder?: string }) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...field}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function renderField<T extends FieldValues>(
  fieldConfig: FieldConfig<T>,
  field: any,
  fieldState: any
) {
  const { type, placeholder, options, multiple, accept, maxFiles, rows, min, max, step, render } = fieldConfig;

  if (render) {
    return render(field, fieldState);
  }

  switch (type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={fieldState.error ? 'border-destructive' : ''}
        />
      );

    case 'password':
      return (
        <PasswordField
          field={field}
          placeholder={placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...field}
          placeholder={placeholder}
          rows={rows || 3}
          className={fieldState.error ? 'border-destructive' : ''}
        />
      );

    case 'select':
      return (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          {options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${option.value}`}
                checked={field.value?.includes(option.value)}
                onCheckedChange={(checked) => {
                  const currentValue = field.value || [];
                  if (checked) {
                    field.onChange([...currentValue, option.value]);
                  } else {
                    field.onChange(currentValue.filter((v: any) => v !== option.value));
                  }
                }}
              />
              <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
          <Label htmlFor={field.name}>{placeholder}</Label>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
          <Label htmlFor={field.name}>{placeholder}</Label>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${field.name}-${option.value}`}
                name={field.name}
                value={option.value}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </div>
      );

    case 'date':
      return (
        <div className="relative">
          <Input
            {...field}
            type="date"
            className={cn('pr-10', fieldState.error ? 'border-destructive' : '')}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      );

    case 'file':
      return (
        <FileUpload
          onFilesChange={(files) => field.onChange(files)}
          acceptedFileTypes={accept ? { [accept]: [accept] } : undefined}
          maxFiles={maxFiles}
          showPreview={true}
        />
      );

    default:
      return (
        <Input
          {...field}
          placeholder={placeholder}
          className={fieldState.error ? 'border-destructive' : ''}
        />
      );
  }
}

export function FormBuilder<T extends FieldValues>({
  fields,
  defaultValues,
  validation,
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  className,
  loading = false,
  disabled = false,
  layout = 'vertical',
  columns = 1,
}: FormConfig<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<T>({
    defaultValues,
    resolver: validation ? zodResolver(validation) : undefined,
  });

  const watchedValues = watch();

  const shouldShowField = (fieldConfig: FieldConfig<T>) => {
    if (!fieldConfig.conditional) return true;

    const { field: conditionField, value: conditionValue, operator = 'equals' } = fieldConfig.conditional;
    const currentValue = watchedValues[conditionField];

    switch (operator) {
      case 'equals':
        return currentValue === conditionValue;
      case 'not_equals':
        return currentValue !== conditionValue;
      case 'includes':
        return Array.isArray(currentValue) && currentValue.includes(conditionValue);
      case 'not_includes':
        return Array.isArray(currentValue) && !currentValue.includes(conditionValue);
      default:
        return true;
    }
  };

  const getGridClasses = () => {
    if (layout === 'grid') {
      return {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      }[columns];
    }
    return '';
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      <div
        className={cn(
          layout === 'grid' && `grid gap-6 ${getGridClasses()}`,
          layout === 'vertical' && 'space-y-6',
          layout === 'horizontal' && 'space-y-4'
        )}
      >
        {fields
          .filter(shouldShowField)
          .map((fieldConfig) => (
            <div
              key={fieldConfig.name}
              className={cn(
                'space-y-2',
                layout === 'horizontal' && 'flex items-center space-y-0 space-x-4',
                fieldConfig.className
              )}
            >
              <div className={layout === 'horizontal' ? 'w-1/3' : ''}>
                <Label
                  htmlFor={fieldConfig.name}
                  className={cn(
                    fieldConfig.required && "after:content-['*'] after:text-destructive after:ml-1"
                  )}
                >
                  {fieldConfig.label}
                </Label>
                {fieldConfig.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {fieldConfig.description}
                  </p>
                )}
              </div>

              <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                <Controller
                  name={fieldConfig.name}
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      {renderField(
                        { ...fieldConfig, disabled: disabled || fieldConfig.disabled },
                        field,
                        fieldState
                      )}
                    </>
                  )}
                />

                {errors[fieldConfig.name] && (
                  <p className="text-sm text-destructive mt-1 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    {errors[fieldConfig.name]?.message as string}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || loading || disabled}
          className="min-w-[100px]"
        >
          {(isSubmitting || loading) ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}