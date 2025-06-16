
import React, { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-surface p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  {title && (
                    <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-textPrimary">
                      {title}
                    </DialogTitle>
                  )}
                  <button
                    type="button"
                    className="text-textSecondary hover:text-textPrimary text-2xl leading-none p-1 -mr-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={onClose}
                    aria-label="Fechar modal"
                  >
                    &times;
                  </button>
                </div>
                <div className="overflow-y-auto">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;