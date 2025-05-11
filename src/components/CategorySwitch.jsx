// src/components/CategorySwitch.jsx
import { Switch } from '@headlessui/react';

export default function CategorySwitch({ label, isChecked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isChecked}
        onChange={onChange}
        className={`${isChecked ? 'bg-blue-600' : 'bg-gray-700'}
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
      >
        <span
          className={`${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span>{label}</span>
    </div>
  );
}
