import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { templates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST: Copy fieldConfig from one template to another
export async function POST(request: Request) {
  try {
    const { sourceTemplateId, targetTemplateId } = await request.json();

    if (!sourceTemplateId || !targetTemplateId) {
      return NextResponse.json({ error: 'Source and target template IDs are required' }, { status: 400 });
    }

    // 1. Fetch Source Template
    const sourceTemplate = await db.query.templates.findFirst({
      where: eq(templates.id, sourceTemplateId)
    });

    if (!sourceTemplate) {
      return NextResponse.json({ error: 'Source template not found' }, { status: 404 });
    }

    // 2. Copy fieldConfig to Target
    await db
      .update(templates)
      .set({ 
        fieldConfig: sourceTemplate.fieldConfig || {},
        updatedAt: new Date()
      })
      .where(eq(templates.id, targetTemplateId));

    return NextResponse.json({ 
      success: true,
      message: 'Configuration copied successfully',
      fieldsCount: Object.keys(sourceTemplate.fieldConfig || {}).length
    });

  } catch (error) {
    console.error('Copy config error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
