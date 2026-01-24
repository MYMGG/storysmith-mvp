export type StationType = "interaction" | "achievement" | "system";
export type ActId = "ACT_I" | "ACT_II" | "ACT_III" | "META";
export type ToneProfile = "showman" | "craftsman" | "ceremonial" | "calm";

export type EntryTarget =
	| { kind: "route"; path: string }                // e.g. "/", "/projects", "/viewer/[bookId]"
	| { kind: "tab"; index: 0 | 1 | 2 };             // current app uses activeTab 0/1/2

export interface ValidationRule {
	id: string;                                     // stable id for analytics + recovery mapping
	description: string;                             // human-readable
	requires?: string[];                             // StoryState paths / conceptual fields
}

export interface RecoveryPolicy {
	retryable?: boolean;                             // safe to retry same action
	resumable?: boolean;                             // can resume from checkpoint
	rollbackSafe?: boolean;                          // can rollback to previous checkpoint
	notes?: string;                                  // plain-language guidance placeholder
}

export interface StationNext {
	to: string;                                      // station id
	when?: string;                                   // declarative condition expression (v1: doc-only)
}

export interface Station {
	id: string;
	actId: ActId;
	type: StationType;

	title: string;
	description?: string;

	entry?: EntryTarget;                             // where the station "lives" in current UI
	toneProfile?: ToneProfile;

	inputsNeeded?: string[];                         // conceptual inputs
	outputsProduced?: string[];                      // conceptual outputs/artifacts
	validations?: ValidationRule[];                  // declarative gates
	recovery?: RecoveryPolicy;                       // declarative only

	next?: StationNext[];                            // declarative flow graph
	tags?: string[];                                 // e.g. ["artifact:hero-card", "checkpoint"]
}
