import { prisma } from "@/lib/prisma";

function getDifference(obj1, obj2) {
  const diff = {};
  for (const key in obj2) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = obj2[key];
    }
  }
  return diff;
}

export async function createAuditLog({ req, userId, action, resource, resourceId, oldData, newData }) {
  try {
    let finalOldValue = oldData || null;
    let finalNewValue = newData || null;

    if (action === "UPDATE" && oldData && newData) {
      finalOldValue = getDifference(newData, oldData);
      finalNewValue = getDifference(oldData, newData);
    }
    
    if (action === "UPDATE" && Object.keys(finalNewValue).length === 0) {
      return; 
    }

    await prisma.audit_logs.create({
      data: {
        user_id: userId || "system",
        action,
        resource,
        resource_id: resourceId?.toString(),
        old_value: finalOldValue,
        new_value: finalNewValue,
        ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
        user_agent: req.headers.get("user-agent"),
      },
    });
  } catch (error) {
    console.error("Gagal mencatat audit log:", error);
  }
}