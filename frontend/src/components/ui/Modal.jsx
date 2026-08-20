import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 640
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 50
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '32px',
                  width: '90vw',
                  maxWidth: maxWidth,
                  zIndex: 51,
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: description ? '8px' : '24px' }}>
                  <Dialog.Title style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                  </Dialog.Title>
                  <Dialog.Close style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={20} />
                  </Dialog.Close>
                </div>
                {description && (
                  <Dialog.Description style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {description}
                  </Dialog.Description>
                )}
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
