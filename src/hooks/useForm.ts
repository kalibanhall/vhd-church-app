/**
 * Hook useForm - Gestion des formulaires
 * Validation, état, et soumission simplifiée
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { useState, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';

export type ValidationRule<T> = {
  validate: (value: unknown, formData: T) => boolean;
  message: string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

export type FormErrors<T> = {
  [K in keyof T]?: string[];
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  clearError: (name: keyof T) => void;
  reset: () => void;
  validate: () => boolean;
  validateField: (name: keyof T) => string[];
}

/**
 * Hook pour gérer les formulaires avec validation
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationRules = {} as ValidationRules<T>,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérifier si le formulaire est modifié
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Vérifier si le formulaire est valide
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || 
           Object.values(errors).every((fieldErrors) => !fieldErrors || fieldErrors.length === 0);
  }, [errors]);

  // Valider un champ
  const validateField = useCallback(
    (name: keyof T): string[] => {
      const rules = validationRules[name];
      if (!rules) return [];

      const fieldErrors: string[] = [];
      for (const rule of rules) {
        if (!rule.validate(values[name], values)) {
          fieldErrors.push(rule.message);
        }
      }
      return fieldErrors;
    },
    [values, validationRules]
  );

  // Valider tout le formulaire
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isFormValid = true;

    for (const name of Object.keys(validationRules) as Array<keyof T>) {
      const fieldErrors = validateField(name);
      if (fieldErrors.length > 0) {
        newErrors[name] = fieldErrors;
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    return isFormValid;
  }, [validateField, validationRules]);

  // Définir une valeur
  const setValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));
      
      if (validateOnChange) {
        const fieldErrors = validateField(name);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
      }
    },
    [validateOnChange, validateField]
  );

  // Définir plusieurs valeurs
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Gérer le changement d'input
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) || 0 
          : value;
      
      setValue(name as keyof T, newValue as T[keyof T]);
    },
    [setValue]
  );

  // Gérer le blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const fieldErrors = validateField(name as keyof T);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
      }
    },
    [validateOnBlur, validateField]
  );

  // Définir une erreur
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: [...(prev[name] || []), error],
    }));
  }, []);

  // Effacer une erreur
  const clearError = useCallback((name: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Marquer tous les champs comme touchés
      const allTouched: FormTouched<T> = {};
      for (const key of Object.keys(values) as Array<keyof T>) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Valider
      if (!validate()) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setValues,
    setError,
    clearError,
    reset,
    validate,
    validateField,
  };
}

// Règles de validation prédéfinies
export const validators = {
  required: (message = 'Ce champ est requis'): ValidationRule<unknown> => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  email: (message = 'Email invalide'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<unknown> => ({
    validate: (value) => {
      if (!value) return true;
      return String(value).length >= min;
    },
    message: message || `Minimum ${min} caractères`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<unknown> => ({
    validate: (value) => {
      if (!value) return true;
      return String(value).length <= max;
    },
    message: message || `Maximum ${max} caractères`,
  }),

  min: (min: number, message?: string): ValidationRule<unknown> => ({
    validate: (value) => {
      if (value === undefined || value === null || value === '') return true;
      return Number(value) >= min;
    },
    message: message || `Minimum ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<unknown> => ({
    validate: (value) => {
      if (value === undefined || value === null || value === '') return true;
      return Number(value) <= max;
    },
    message: message || `Maximum ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Format invalide'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(String(value));
    },
    message,
  }),

  phone: (message = 'Numéro de téléphone invalide'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (!value) return true;
      return /^[+]?[\d\s-()]{10,}$/.test(String(value));
    },
    message,
  }),
};

export default useForm;
