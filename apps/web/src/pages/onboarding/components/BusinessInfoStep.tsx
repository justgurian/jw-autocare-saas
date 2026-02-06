interface FormData {
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
  primaryColor: string;
  services: string[];
  specials: { title: string; discount: string; description: string }[];
  brandVoice: string;
  vehiclePreferences: { lovedMakes: Array<{makeId: string; models?: string[]}>; neverMakes: string[] };
  websiteUrl: string;
  styleFamilyIds: string[];
}

interface BusinessInfoStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function BusinessInfoStep({ formData, setFormData }: BusinessInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Business Name *
        </label>
        <input
          type="text"
          className="input-retro"
          placeholder="Your Auto Repair Shop"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Phone
          </label>
          <input
            type="tel"
            className="input-retro"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            City
          </label>
          <input
            type="text"
            className="input-retro"
            placeholder="Phoenix"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
