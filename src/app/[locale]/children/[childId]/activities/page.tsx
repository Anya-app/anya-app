"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import type {
  Activity,
  ActivityGoal,
  ActivityGoalStatus,
  Child,
  SubActivity,
  SubActivityStatus,
} from "@/types";
import {
  getChildById,
  saveChild,
  sortActivityGoalsNewestFirst,
} from "@/lib/childStorage";
import {
  Card,
  SectionLabel,
  EmptyState,
} from "@/components/child/DetailPrimitives";

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeEmptyActivity(): Activity {
  return {
    id: makeId(),
    activityName: "",
    category: "",
    date: "",
    endDate: "",
    role: "",
    note: "",
  };
}

function makeEmptySubActivity(): SubActivity {
  return {
    id: makeId(),
    title: "",
    date: "",
    endDate: "",
    status: "planned",
    target: "",
    result: "",
    note: "",
  };
}

function makeEmptyGoal(): ActivityGoal {
  const now = new Date().toISOString();

  return {
    id: makeId(),
    goalName: "",
    category: "",
    targetDate: "",
    status: "planned",
    note: "",
    subActivities: [makeEmptySubActivity()],
    createdAt: now,
    updatedAt: now,
  };
}

function fmtDate(iso?: string): string {
  if (!iso) return "-";

  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateTime(iso?: string): number {
  if (!iso) return 0;
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
}

function goalStatusLabel(status?: ActivityGoalStatus): string {
  const labels: Record<ActivityGoalStatus, string> = {
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return status ? labels[status] : "Planned";
}

function subStatusLabel(status?: SubActivityStatus): string {
  const labels: Record<SubActivityStatus, string> = {
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    passed: "Passed",
    not_passed: "Not Passed",
  };

  return status ? labels[status] : "Planned";
}

function statusBadgeStyle(status?: ActivityGoalStatus | SubActivityStatus): CSSProperties {
  if (status === "completed" || status === "passed") {
    return { background: "#E1F5EE", color: "#087F5B" };
  }
  if (status === "in_progress") {
    return { background: "#E0F2FE", color: "#0369A1" };
  }
  if (status === "cancelled" || status === "not_passed") {
    return { background: "#FEE2E2", color: "#DC2626" };
  }
  return { background: "#FAEEDA", color: "#A16207" };
}

type TimelineItem = {
  id: string;
  title: string;
  date: string;
  type: "activity" | "goal" | "milestone";
  detail?: string;
};

export default function ActivitiesPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);

  const [draftActivity, setDraftActivity] = useState<Activity>(makeEmptyActivity());
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  const [draftGoal, setDraftGoal] = useState<ActivityGoal>(makeEmptyGoal());
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  useEffect(() => {
    const found = getChildById(childId);
    if (found) setChild(found);
  }, [childId]);

  const activities = useMemo(
    () =>
      [...(child?.activities ?? [])].sort(
        (a, b) => dateTime(b.date) - dateTime(a.date)
      ),
    [child]
  );

  const goals = useMemo(
    () => sortActivityGoalsNewestFirst(child?.activityGoals ?? []),
    [child]
  );

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    activities.forEach((activity) => {
      if (!activity.date) return;
      items.push({
        id: `activity-${activity.id}`,
        title: activity.activityName,
        date: activity.date,
        type: "activity",
        detail: activity.category || activity.role || undefined,
      });
    });

    goals.forEach((goal) => {
      if (goal.targetDate) {
        items.push({
          id: `goal-${goal.id}`,
          title: goal.goalName,
          date: goal.targetDate,
          type: "goal",
          detail: "Goal target date",
        });
      }

      goal.subActivities.forEach((subActivity) => {
        if (!subActivity.date) return;
        items.push({
          id: `sub-${goal.id}-${subActivity.id}`,
          title: subActivity.title,
          date: subActivity.date,
          type: "milestone",
          detail: goal.goalName,
        });
      });
    });

    return items.sort((a, b) => dateTime(b.date) - dateTime(a.date));
  }, [activities, goals]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const activityFiles = (child.attachments ?? []).filter(
    (attachment) => attachment.section === "activities"
  );

  function openAddActivityForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingActivityId(null);
    setIsActivityFormOpen(true);
  }

  function openEditActivityForm(activity: Activity) {
    setDraftActivity({ ...activity });
    setEditingActivityId(activity.id);
    setIsActivityFormOpen(true);
  }

  function cancelActivityForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingActivityId(null);
    setIsActivityFormOpen(false);
  }

  function updateActivityField(field: keyof Activity, value: string) {
    setDraftActivity((previous) => ({ ...previous, [field]: value }));
  }

  function saveActivity() {
    if (!child) return;

    if (!draftActivity.activityName.trim()) {
      alert("Please enter activity name.");
      return;
    }

    const currentChild: Child = child;
    const existing = currentChild.activities ?? [];
    const updatedActivities = editingActivityId
      ? existing.map((activity) =>
          activity.id === editingActivityId ? draftActivity : activity
        )
      : [draftActivity, ...existing];

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activities: updatedActivities,
    };

    saveChild(childId, updatedChild);
    setChild(updatedChild);
    cancelActivityForm();
  }

  function deleteActivity(activityId: string) {
    if (!child) return;
    if (!window.confirm("Delete this activity?")) return;

    const currentChild: Child = child;
    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activities: (currentChild.activities ?? []).filter(
        (activity) => activity.id !== activityId
      ),
    };

    saveChild(childId, updatedChild);
    setChild(updatedChild);
  }

  function openAddGoalForm() {
    setDraftGoal(makeEmptyGoal());
    setEditingGoalId(null);
    setIsGoalFormOpen(true);
  }

  function openEditGoalForm(goal: ActivityGoal) {
    setDraftGoal({
      ...goal,
      subActivities:
        goal.subActivities.length > 0
          ? goal.subActivities.map((subActivity) => ({ ...subActivity }))
          : [makeEmptySubActivity()],
    });
    setEditingGoalId(goal.id);
    setIsGoalFormOpen(true);
  }

  function cancelGoalForm() {
    setDraftGoal(makeEmptyGoal());
    setEditingGoalId(null);
    setIsGoalFormOpen(false);
  }

  function updateGoalField<K extends keyof ActivityGoal>(
    field: K,
    value: ActivityGoal[K]
  ) {
    setDraftGoal((previous) => ({
      ...previous,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  }

  function addSubActivity() {
    setDraftGoal((previous) => ({
      ...previous,
      subActivities: [...previous.subActivities, makeEmptySubActivity()],
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateSubActivity<K extends keyof SubActivity>(
    subActivityId: string,
    field: K,
    value: SubActivity[K]
  ) {
    setDraftGoal((previous) => ({
      ...previous,
      subActivities: previous.subActivities.map((subActivity) =>
        subActivity.id === subActivityId
          ? { ...subActivity, [field]: value }
          : subActivity
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  function removeSubActivity(subActivityId: string) {
    setDraftGoal((previous) => ({
      ...previous,
      subActivities:
        previous.subActivities.length === 1
          ? [makeEmptySubActivity()]
          : previous.subActivities.filter(
              (subActivity) => subActivity.id !== subActivityId
            ),
      updatedAt: new Date().toISOString(),
    }));
  }

  function saveGoal() {
    if (!child) return;

    if (!draftGoal.goalName.trim()) {
      alert("Please enter goal name.");
      return;
    }

    const currentChild: Child = child;
    const cleanedSubActivities = draftGoal.subActivities.filter(
      (subActivity) =>
        subActivity.title.trim() ||
        subActivity.date ||
        subActivity.target?.trim() ||
        subActivity.result?.trim() ||
        subActivity.note?.trim()
    );

    const goalToSave: ActivityGoal = {
      ...draftGoal,
      updatedAt: new Date().toISOString(),
      subActivities: cleanedSubActivities.sort(
        (a, b) => dateTime(b.date) - dateTime(a.date)
      ),
    };

    const existing = currentChild.activityGoals ?? [];
    const updatedGoals = editingGoalId
      ? existing.map((goal) => (goal.id === editingGoalId ? goalToSave : goal))
      : [goalToSave, ...existing];

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activityGoals: sortActivityGoalsNewestFirst(updatedGoals),
    };

    saveChild(childId, updatedChild);
    setChild(updatedChild);
    cancelGoalForm();
  }

  function deleteGoal(goalId: string) {
    if (!child) return;
    if (!window.confirm("Delete this goal and all sub activities?")) return;

    const currentChild: Child = child;
    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activityGoals: (currentChild.activityGoals ?? []).filter(
        (goal) => goal.id !== goalId
      ),
    };

    saveChild(childId, updatedChild);
    setChild(updatedChild);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!child) return;

    const currentChild: Child = child;
    const file = event.target.files?.[0];
    if (!file) return;

    const inputElement = event.target;
    const reader = new FileReader();

    reader.onload = () => {
      const updatedChild: Child = {
        ...currentChild,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(currentChild.attachments ?? []),
          {
            id: makeId(),
            section: "activities",
            name: file.name,
            type: file.type,
            dataUrl: String(reader.result),
            createdAt: new Date().toISOString(),
          },
        ],
      };

      saveChild(childId, updatedChild);
      setChild(updatedChild);
      inputElement.value = "";
    };

    reader.readAsDataURL(file);
  }

  return (
    <div style={pageStyle}>
      <Card>
        <label style={uploadButtonStyle}>
          Upload Activity File
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
      </Card>

      <Card>
        <SectionLabel
          emoji="🎯"
          label="Goals & Milestones"
          color="#7F77DD"
          bg="#EEEDFE"
        />

        {goals.length > 0 ? (
          <div style={listStyle}>
            {goals.map((goal, goalIndex) => (
              <div key={goal.id} style={goalCardStyle}>
                <div style={rowBetweenStyle}>
                  <div>
                    <div style={titleStyle}>{goal.goalName}</div>
                    <div style={metaStyle}>
                      {goal.category || "General goal"} · Target: {fmtDate(goal.targetDate)}
                    </div>
                  </div>
                  <div style={rightHeaderStyle}>
                    {goalIndex === 0 ? <span style={latestBadgeStyle}>LATEST</span> : null}
                    <span style={{ ...badgeStyle, ...statusBadgeStyle(goal.status) }}>
                      {goalStatusLabel(goal.status)}
                    </span>
                  </div>
                </div>

                {goal.note ? <div style={noteStyle}>{goal.note}</div> : null}

                <div style={subListStyle}>
                  {goal.subActivities.length > 0 ? (
                    goal.subActivities.map((subActivity) => (
                      <div key={subActivity.id} style={subItemStyle}>
                        <div style={rowBetweenStyle}>
                          <strong style={{ color: "#374151", fontSize: 14 }}>
                            {subActivity.title || "Untitled milestone"}
                          </strong>
                          <span
                            style={{
                              ...badgeStyle,
                              ...statusBadgeStyle(subActivity.status),
                            }}
                          >
                            {subStatusLabel(subActivity.status)}
                          </span>
                        </div>
                        <div style={metaStyle}>
                          Date: {fmtDate(subActivity.date)}
                          {subActivity.target ? ` · Target: ${subActivity.target}` : ""}
                          {subActivity.result ? ` · Result: ${subActivity.result}` : ""}
                        </div>
                        {subActivity.note ? (
                          <div style={{ ...noteStyle, marginTop: 6 }}>
                            {subActivity.note}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div style={emptySubStyle}>No sub activities added yet.</div>
                  )}
                </div>

                <div style={smallActionRowStyle}>
                  <button
                    onClick={() => openEditGoalForm(goal)}
                    style={smallEditButtonStyle}
                  >
                    Edit Goal
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    style={smallDeleteButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🎯"
            message="No goals yet. Add goals such as an entrance exam, TOEFL, JLPT N1, or audition."
          />
        )}

        {!isGoalFormOpen ? (
          <button onClick={openAddGoalForm} style={addButtonStyle}>
            + Add Goal
          </button>
        ) : (
          <GoalEditor
            goal={draftGoal}
            isEditing={Boolean(editingGoalId)}
            onGoalChange={updateGoalField}
            onAddSubActivity={addSubActivity}
            onSubActivityChange={updateSubActivity}
            onRemoveSubActivity={removeSubActivity}
            onSave={saveGoal}
            onCancel={cancelGoalForm}
          />
        )}
      </Card>

      <Card>
        <SectionLabel
          emoji="🗓️"
          label="Activity Timeline — Latest First"
          color="#2563EB"
          bg="#EFF6FF"
        />

        {timelineItems.length > 0 ? (
          <div style={timelineStyle}>
            {timelineItems.map((item) => (
              <div key={item.id} style={timelineRowStyle}>
                <div style={datePillStyle}>{fmtDate(item.date)}</div>
                <div style={{ flex: 1 }}>
                  <div style={titleStyle}>{item.title}</div>
                  <div style={metaStyle}>
                    {item.type === "milestone"
                      ? "Milestone"
                      : item.type === "goal"
                        ? "Goal"
                        : "Activity"}
                    {item.detail ? ` · ${item.detail}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState emoji="🗓️" message="No timeline activities recorded yet." />
        )}
      </Card>

      <Card>
        <SectionLabel
          emoji="⭐"
          label="Activities & Events"
          color="#BA7517"
          bg="#FAEEDA"
        />

        {activities.length > 0 ? (
          <div style={listStyle}>
            {activities.map((activity) => (
              <div key={activity.id} style={activityItemStyle}>
                <div style={rowBetweenStyle}>
                  <div>
                    <div style={titleStyle}>{activity.activityName}</div>
                    <div style={metaStyle}>
                      {fmtDate(activity.date)}
                      {activity.endDate ? ` — ${fmtDate(activity.endDate)}` : ""}
                      {activity.category ? ` · ${activity.category}` : ""}
                    </div>
                  </div>
                  <div style={smallActionRowStyle}>
                    <button
                      onClick={() => openEditActivityForm(activity)}
                      style={smallEditButtonStyle}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      style={smallDeleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {activity.role ? <div style={metaStyle}>Role: {activity.role}</div> : null}
                {activity.note ? <div style={noteStyle}>{activity.note}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState emoji="⭐" message="No activities recorded yet." />
        )}

        {!isActivityFormOpen ? (
          <button onClick={openAddActivityForm} style={addButtonStyle}>
            + Add Activity Event
          </button>
        ) : (
          <ActivityEditor
            activity={draftActivity}
            isEditing={Boolean(editingActivityId)}
            onChange={updateActivityField}
            onSave={saveActivity}
            onCancel={cancelActivityForm}
          />
        )}
      </Card>

      <Card>
        <SectionLabel
          emoji="📎"
          label="Activity Attachments"
          color="#1D9E75"
          bg="#E1F5EE"
        />

        {activityFiles.length > 0 ? (
          <div style={listStyle}>
            {activityFiles.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.dataUrl}
                download={attachment.name}
                style={fileLinkStyle}
              >
                📎 {attachment.name}
              </a>
            ))}
          </div>
        ) : (
          <EmptyState emoji="📎" message="No activity files uploaded yet." />
        )}
      </Card>
    </div>
  );
}

function GoalEditor({
  goal,
  isEditing,
  onGoalChange,
  onAddSubActivity,
  onSubActivityChange,
  onRemoveSubActivity,
  onSave,
  onCancel,
}: {
  goal: ActivityGoal;
  isEditing: boolean;
  onGoalChange: <K extends keyof ActivityGoal>(
    field: K,
    value: ActivityGoal[K]
  ) => void;
  onAddSubActivity: () => void;
  onSubActivityChange: <K extends keyof SubActivity>(
    subActivityId: string,
    field: K,
    value: SubActivity[K]
  ) => void;
  onRemoveSubActivity: (subActivityId: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={editorStyle}>
      <div style={editorTitleStyle}>{isEditing ? "Edit Goal" : "New Goal"}</div>

      <div style={formGridStyle}>
        <InputField
          label="Goal Name"
          value={goal.goalName}
          placeholder="e.g. Pass JLPT N1 / Piano Audition / Entrance Exam"
          onChange={(value) => onGoalChange("goalName", value)}
        />
        <InputField
          label="Category"
          value={goal.category ?? ""}
          placeholder="e.g. Language, Music, Academic"
          onChange={(value) => onGoalChange("category", value)}
        />
        <label style={labelStyle}>
          <span>Target Date</span>
          <input
            type="date"
            style={inputStyle}
            value={goal.targetDate ?? ""}
            onChange={(event) => onGoalChange("targetDate", event.target.value)}
          />
        </label>
        <label style={labelStyle}>
          <span>Status</span>
          <select
            style={inputStyle}
            value={goal.status ?? "planned"}
            onChange={(event) =>
              onGoalChange("status", event.target.value as ActivityGoalStatus)
            }
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          <span>Goal Note</span>
          <textarea
            style={textareaStyle}
            value={goal.note ?? ""}
            placeholder="Target score, competition detail, preparation note..."
            onChange={(event) => onGoalChange("note", event.target.value)}
          />
        </label>
      </div>

      <div style={subEditorHeadingStyle}>
        <strong>Sub Activities / Milestones</strong>
        <button onClick={onAddSubActivity} style={addSmallButtonStyle}>
          + Add Sub Activity
        </button>
      </div>

      {goal.subActivities.map((subActivity, index) => (
        <div key={subActivity.id} style={subEditorStyle}>
          <div style={rowBetweenStyle}>
            <strong style={{ color: "#4B5563" }}>Sub Activity {index + 1}</strong>
            <button
              onClick={() => onRemoveSubActivity(subActivity.id)}
              style={smallDeleteButtonStyle}
            >
              Remove
            </button>
          </div>

          <div style={formGridStyle}>
            <InputField
              label="Sub Activity"
              value={subActivity.title}
              placeholder="e.g. Score over target / Passed audition round 1"
              onChange={(value) =>
                onSubActivityChange(subActivity.id, "title", value)
              }
            />
            <label style={labelStyle}>
              <span>Status</span>
              <select
                style={inputStyle}
                value={subActivity.status ?? "planned"}
                onChange={(event) =>
                  onSubActivityChange(
                    subActivity.id,
                    "status",
                    event.target.value as SubActivityStatus
                  )
                }
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="passed">Passed</option>
                <option value="not_passed">Not Passed</option>
              </select>
            </label>
            <label style={labelStyle}>
              <span>Date</span>
              <input
                type="date"
                style={inputStyle}
                value={subActivity.date ?? ""}
                onChange={(event) =>
                  onSubActivityChange(subActivity.id, "date", event.target.value)
                }
              />
            </label>
            <InputField
              label="Target"
              value={subActivity.target ?? ""}
              placeholder="e.g. TOEFL > 100 / N1 Pass"
              onChange={(value) =>
                onSubActivityChange(subActivity.id, "target", value)
              }
            />
            <InputField
              label="Result"
              value={subActivity.result ?? ""}
              placeholder="e.g. TOEFL 105 / Passed round 1"
              onChange={(value) =>
                onSubActivityChange(subActivity.id, "result", value)
              }
            />
            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              <span>Note</span>
              <textarea
                style={textareaStyle}
                value={subActivity.note ?? ""}
                onChange={(event) =>
                  onSubActivityChange(subActivity.id, "note", event.target.value)
                }
              />
            </label>
          </div>
        </div>
      ))}

      <div style={actionRowStyle}>
        <button onClick={onSave} style={saveButtonStyle}>
          Save Goal
        </button>
        <button onClick={onCancel} style={cancelButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ActivityEditor({
  activity,
  isEditing,
  onChange,
  onSave,
  onCancel,
}: {
  activity: Activity;
  isEditing: boolean;
  onChange: (field: keyof Activity, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={editorStyle}>
      <div style={editorTitleStyle}>
        {isEditing ? "Edit Activity Event" : "New Activity Event"}
      </div>
      <div style={formGridStyle}>
        <InputField
          label="Activity Name"
          value={activity.activityName}
          onChange={(value) => onChange("activityName", value)}
        />
        <InputField
          label="Category"
          value={activity.category ?? ""}
          onChange={(value) => onChange("category", value)}
        />
        <label style={labelStyle}>
          <span>Date</span>
          <input
            type="date"
            style={inputStyle}
            value={activity.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
        </label>
        <label style={labelStyle}>
          <span>End Date</span>
          <input
            type="date"
            style={inputStyle}
            value={activity.endDate ?? ""}
            onChange={(event) => onChange("endDate", event.target.value)}
          />
        </label>
        <InputField
          label="Role"
          value={activity.role ?? ""}
          onChange={(value) => onChange("role", value)}
        />
        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          <span>Note</span>
          <textarea
            style={textareaStyle}
            value={activity.note ?? ""}
            onChange={(event) => onChange("note", event.target.value)}
          />
        </label>
      </div>
      <div style={actionRowStyle}>
        <button onClick={onSave} style={saveButtonStyle}>
          Save Activity
        </button>
        <button onClick={onCancel} style={cancelButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={labelStyle}>
      <span>{label}</span>
      <input
        style={inputStyle}
        value={value}
        placeholder={placeholder ?? label}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const pageStyle: CSSProperties = {
  padding: "14px 16px 120px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
  boxSizing: "border-box",
  background: "#FFFFFF",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 76,
  resize: "vertical",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#6B7280",
  fontSize: 13,
};

const uploadButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 18px",
  background: "#E1F5EE",
  color: "#0F9F79",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 500,
};

const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "12px 0",
};

const goalCardStyle: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 15,
  padding: 13,
  background: "#FFFFFF",
};

const activityItemStyle: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 12,
  background: "#FFFFFF",
};

const rowBetweenStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const rightHeaderStyle: CSSProperties = {
  display: "flex",
  gap: 5,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const titleStyle: CSSProperties = {
  color: "#111827",
  fontSize: 15,
  fontWeight: 700,
};

const metaStyle: CSSProperties = {
  color: "#6B7280",
  fontSize: 13,
  marginTop: 3,
};

const badgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "4px 9px",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const latestBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: "#EEEDFE",
  color: "#635BCE",
};

const noteStyle: CSSProperties = {
  background: "#F9FAFB",
  borderRadius: 10,
  padding: 8,
  color: "#4B5563",
  fontSize: 13,
  marginTop: 9,
};

const subListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  marginTop: 11,
};

const subItemStyle: CSSProperties = {
  background: "#F9FAFB",
  borderRadius: 12,
  padding: 10,
};

const emptySubStyle: CSSProperties = {
  color: "#9CA3AF",
  fontSize: 13,
  padding: 9,
};

const smallActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 10,
};

const smallEditButtonStyle: CSSProperties = {
  background: "#EEEDFE",
  color: "#635BCE",
  border: "none",
  padding: "6px 12px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 600,
};

const smallDeleteButtonStyle: CSSProperties = {
  background: "#FEE2E2",
  color: "#DC2626",
  border: "none",
  padding: "6px 12px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 600,
};

const addButtonStyle: CSSProperties = {
  width: "100%",
  border: "1px dashed #7F77DD",
  background: "#F5F3FF",
  color: "#6658D3",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 10,
};

const editorStyle: CSSProperties = {
  border: "1px solid #DDD6FE",
  borderRadius: 14,
  padding: 13,
  background: "#FAFAFF",
  marginTop: 12,
};

const editorTitleStyle: CSSProperties = {
  fontSize: 16,
  color: "#374151",
  fontWeight: 700,
  marginBottom: 12,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
  gap: 10,
};

const subEditorHeadingStyle: CSSProperties = {
  marginTop: 16,
  marginBottom: 10,
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const addSmallButtonStyle: CSSProperties = {
  border: "none",
  background: "#E1F5EE",
  color: "#087F5B",
  borderRadius: 999,
  padding: "7px 11px",
  fontWeight: 700,
  cursor: "pointer",
};

const subEditorStyle: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  background: "#FFFFFF",
  padding: 11,
  marginBottom: 10,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 13,
};

const saveButtonStyle: CSSProperties = {
  flex: 1,
  border: "none",
  background: "#1D9E75",
  color: "#FFFFFF",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const cancelButtonStyle: CSSProperties = {
  flex: 1,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  color: "#6B7280",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const timelineStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 9,
  padding: "12px 0",
};

const timelineRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  border: "1px solid #E5E7EB",
  borderRadius: 13,
  padding: 10,
  background: "#FFFFFF",
};

const datePillStyle: CSSProperties = {
  minWidth: 88,
  padding: "8px 7px",
  textAlign: "center",
  background: "#EFF6FF",
  color: "#2563EB",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
};

const fileLinkStyle: CSSProperties = {
  display: "block",
  color: "#087F5B",
  textDecoration: "none",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 11,
};
