import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { NotesList } from '../components/notes';

const NotesPage = () => {
  const location = useLocation();
  const editNote = location.state?.editNote;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NotesList initialEditNote={editNote} />
    </motion.div>
  );
};

export default NotesPage;
