import {
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Modal from '../common/Modal';

// Validation schema
const noteSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(1, 'Content cannot be empty'),
  category: yup
    .string()
    .max(50, 'Category must be less than 50 characters'),
  description: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
  tags: yup
    .array()
    .of(yup.string())
    .max(10, 'Maximum 10 tags allowed'),
});

const NoteForm = ({ 
  note, 
  isOpen, 
  onClose, 
  onSave, 
  loading 
}) => {
  const [newTag, setNewTag] = useState('');
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
      category: note?.category || '',
      description: note?.description || '',
      tags: note?.tags || [],
      isFavorite: note?.isFavorite || false,
      isPublic: note?.isPublic || false,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (note) {
      reset({
        title: note.title || '',
        content: note.content || '',
        category: note.category || '',
        description: note.description || '',
        tags: note.tags || [],
        isFavorite: note.isFavorite || false,
        isPublic: note.isPublic || false,
      });
    } else {
      reset({
        title: '',
        content: '',
        category: '',
        description: '',
        tags: [],
        isFavorite: false,
        isPublic: false,
      });
    }
  }, [note, reset]);

  const addTag = () => {
    if (newTag.trim() && !watchedValues.tags.includes(newTag.trim())) {
      const updatedTags = [...watchedValues.tags, newTag.trim()];
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = watchedValues.tags.filter(tag => tag !== tagToRemove);
    setValue('tags', updatedTags);
  };

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
      <h2 className="text-2xl font-bold mb-4">{watchedValues.title}</h2>
      {watchedValues.category && (
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {watchedValues.category}
          </Badge>
        </div>
      )}
      {watchedValues.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
          {watchedValues.description}
        </p>
      )}
      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {watchedValues.content}
      </div>
      {watchedValues.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {watchedValues.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                  {...register('category')}
                >
                  <option value="">Select a category</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Project">Project</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Idea">Idea</option>
                  <option value="Todo">Todo</option>
                  <option value="Reference">Reference</option>
                  <option value="Journal">Journal</option>
                  <option value="Recipe">Recipe</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <Input
                label="Description"
                placeholder="Brief description (optional)..."
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

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

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    leftIcon={<TagIcon className="w-4 h-4" />}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  size="sm"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>

              {watchedValues.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <XMarkIcon className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              
              {errors.tags && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                  {errors.tags.message}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center space-x-6">
              <Controller
                name="isFavorite"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => {
                          console.log('Favorite checkbox changed:', e.target.checked); // Debug
                          field.onChange(e.target.checked);
                        }}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mark as favorite
                      </span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                      Favorite notes appear in your favorites list for quick access
                    </p>
                  </div>
                )}
              />

              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Share publicly
                      </span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                      Public notes appear in the "Public Notes" tab for everyone to see
                    </p>
                  </div>
                )}
              />
            </div>

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
