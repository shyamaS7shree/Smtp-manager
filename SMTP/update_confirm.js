const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf-8');

  // Add ConfirmModal import if not present
  if (!content.includes('ConfirmModal')) {
    content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter } from "next/navigation";\nimport { ConfirmModal } from "@/components/ui/confirm-modal";');
  }

  // Add state for confirmAction if not present
  if (!content.includes('const [confirmAction, setConfirmAction]')) {
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n  const [confirmAction, setConfirmAction] = useState<{message: string, onConfirm: () => void} | null>(null);');
  }
  
  // Replace single delete
  // const deleteCampaign = async (campaignUid: string) => { ... }
  // We want to transform the if (!window.confirm(...)) logic
  content = content.replace(
    /if\s*\(!window\.confirm\("Are you sure you want to delete this campaign\?"\)\)\s*return;/g,
    `setConfirmAction({
        message: "Are you sure you want to delete this campaign?",
        onConfirm: async () => {
          // ORIGINAL LOGIC WRAPPED`
  );

  // But we need to wrap the rest of the function!
  // This is too fragile with regex. I will instead do it with specific string replacements.
}
