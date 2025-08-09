import {
    DocumentTextIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Badge } from '../common';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Modal from '../common/Modal';

// Validation schema - Updated to match backend NoteRequestDTO
const noteSchema = yup.object({
  title: yup
    .string()
    .max(100, 'Title must be less than 100 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content cannot exceed 10000 characters'),
  description: yup
    .string()
    .max(500, 'Description cannot exceed 500 characters'),
  category: yup
    .string()
    .max(50, 'Category cannot exceed 50 characters'),
});

const NoteForm = ({ 
  note, 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(noteSchema),
    mode: 'onChange',
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      description: note?.description || '',
      category: note?.category || '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (note) {
      reset({
        title: note.title || '',
        content: note.content || '',
        description: note.description || '',
        category: note.category || '',
      });
    } else {
      reset({
        title: '',
        content: '',
        description: '',
        category: '',
      });
    }
  }, [note, reset]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target === contentRef.current) {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      setValue('content', value.substring(0, start) + '\n' + value.substring(end));
      
      // Set cursor position after the new line
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const onSubmit = (data) => {
    onSave({
      ...data,
      id: note?.id,
    });
  };

  const renderPreview = () => (
    <div className="prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-bold mb-4">{watchedValues.title || 'Untitled'}</h2>
      {watchedValues.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 italic">{watchedValues.description}</p>
      )}
      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {watchedValues.content}
      </div>
      {watchedValues.category && (
        <div className="mt-4">
          <Badge variant="outline">
            {watchedValues.category}
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {note ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <EyeSlashIcon className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isPreview ? (
          <Card className="p-6 min-h-96">
            {renderPreview()}
          </Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="Enter note title..."
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                ref={contentRef}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 resize-none"
                placeholder="Start writing your note..."
                onKeyDown={handleKeyDown}
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <Input
              label="Description (Optional)"
              placeholder="Brief description of the note..."
              error={errors.description?.message}
              {...register('description')}
            />

            {/* Category Field */}
            <Input
              label="Category (Optional)"
              placeholder="e.g., Personal, Work, Study..."
              error={errors.category?.message}
              {...register('category')}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!isValid}
              >
                {note ? 'Update Note' : 'Create Note'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default NoteForm;
