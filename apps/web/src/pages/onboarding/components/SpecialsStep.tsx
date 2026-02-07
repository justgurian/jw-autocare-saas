import { useState } from 'react';
import toast from 'react-hot-toast';

interface Special {
  title: string;
  discount: string;
  description: string;
}

interface SpecialsStepProps {
  specials: Special[];
  onSpecialsChange: (specials: Special[]) => void;
}

export default function SpecialsStep({ specials, onSpecialsChange }: SpecialsStepProps) {
  const [showSpecialModal, setShowSpecialModal] = useState(false);
  const [newSpecial, setNewSpecial] = useState<Special>({ title: '', discount: '', description: '' });

  return (
    <div className="py-4">
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
        Add recurring promotions to your Specials Vault (optional)
      </p>

      {/* Added Specials List */}
      {specials.length > 0 && (
        <div className="space-y-2 mb-4">
          {specials.map((special, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-retro-teal/10 border border-retro-teal">
              <div>
                <p className="font-heading uppercase">{special.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{special.discount} - {special.description}</p>
              </div>
              <button
                onClick={() => onSpecialsChange(specials.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Special Form */}
      {showSpecialModal ? (
        <div className="border-2 border-black dark:border-gray-600 p-4 space-y-3">
          <input
            type="text"
            className="input-retro"
            placeholder="Special name (e.g., Monday Oil Change)"
            value={newSpecial.title}
            onChange={(e) => setNewSpecial({ ...newSpecial, title: e.target.value })}
          />
          <input
            type="text"
            className="input-retro"
            placeholder="Discount (e.g., $10 Off, 15% Off)"
            value={newSpecial.discount}
            onChange={(e) => setNewSpecial({ ...newSpecial, discount: e.target.value })}
          />
          <input
            type="text"
            className="input-retro"
            placeholder="Description (e.g., Every Monday)"
            value={newSpecial.description}
            onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              className="btn-retro-primary flex-1"
              onClick={() => {
                if (newSpecial.title && newSpecial.discount) {
                  onSpecialsChange([...specials, newSpecial]);
                  setNewSpecial({ title: '', discount: '', description: '' });
                  setShowSpecialModal(false);
                  toast.success('Special added!');
                } else {
                  toast.error('Please fill in title and discount');
                }
              }}
            >
              Save Special
            </button>
            <button
              className="btn-retro-outline"
              onClick={() => {
                setShowSpecialModal(false);
                setNewSpecial({ title: '', discount: '', description: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            className="btn-retro-outline"
            onClick={() => setShowSpecialModal(true)}
          >
            Add Special
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4 text-center">
        {specials.length === 0
          ? "You can add specials later from the dashboard"
          : `${specials.length} special(s) added`
        }
      </p>
    </div>
  );
}
