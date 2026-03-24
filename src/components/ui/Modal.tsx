import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { WindowContainer } from '../ui/WindowContainer';

interface ModalProps {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText
}) => {
  const { t } = useTranslation();

  return (
    <WindowContainer 
      isOpen={isOpen} 
      onClose={type === 'alert' ? onConfirm : (onCancel || (() => {}))}
      title={title}
      showCloseButton={type === 'alert'}
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${type === 'confirm' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
            {type === 'confirm' ? <HelpCircle size={32} /> : <AlertCircle size={32} />}
          </div>
          <div className="flex-1">
            <p className="text-slate-400 leading-relaxed text-lg">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              {cancelText || t('Cancel')}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 font-bold rounded-2xl transition-all active:scale-95 text-white ${
              type === 'confirm' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {confirmText || (type === 'confirm' ? t('Confirm') : t('OK'))}
          </button>
        </div>
      </div>
    </WindowContainer>
  );
};
