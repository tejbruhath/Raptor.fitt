import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/lib/models/Template';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const templates = await Template.find({ userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, name, description, exercises, tags } = body;

    if (!userId || !name || !exercises || exercises.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const template = await Template.create({
      userId,
      name,
      description,
      exercises,
      tags: tags || [],
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { templateId, userId, name, description, exercises, tags } = body;

    if (!templateId || !userId) {
      return NextResponse.json({ error: 'Template ID and user ID required' }, { status: 400 });
    }

    const template = await Template.findOneAndUpdate(
      { _id: templateId, userId },
      {
        $set: {
          name,
          description,
          exercises,
          tags,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const templateId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!templateId || !userId) {
      return NextResponse.json({ error: 'Template ID and user ID required' }, { status: 400 });
    }

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await Template.deleteOne({ _id: templateId });

    return NextResponse.json({ message: 'Template deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
