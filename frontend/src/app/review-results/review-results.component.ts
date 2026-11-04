import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Finding, Review, ReviewService } from '../review.service';

interface AgentGroup {
  id: string;
  name: string;
  focus: string;
  findings: Finding[];
}

@Component({
  selector: 'app-review-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-results.component.html',
  styleUrl: './review-results.component.css'
})
export class ReviewResultsComponent {
  private readonly reviewService = inject(ReviewService);

  @Input({ required: true }) review!: Review;

  additionalComment = '';
  postingComment = false;
  commentError = '';
  postedCommentUrl = '';
  selectedAgentId: string | null = null;

  get agentGroups(): AgentGroup[] {
    const groups = new Map<string, Finding[]>();
    for (const finding of this.review.findings) {
      const name = finding.agent?.trim() || 'Additional Agent';
      const findings = groups.get(name) || [];
      findings.push(finding);
      groups.set(name, findings);
    }

    return [...groups.entries()]
      .map(([name, findings]) => {
        const agent = this.agentDetails(name);
        return { ...agent, findings };
      })
      .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name))
      .map(({ order: _order, ...group }) => group);
  }

  get selectedAgentGroup(): AgentGroup | undefined {
    return this.agentGroups.find(group => group.id === this.selectedAgentId);
  }

  toggleAgent(agentId: string): void {
    this.selectedAgentId = this.selectedAgentId === agentId ? null : agentId;
  }

  private agentDetails(name: string): AgentGroup & { order: number } {
    const knownAgents: Record<string, { id: string; focus: string; order: number }> = {
      'Security Agent': { id: 'security', focus: 'Security risks · secrets, unsafe execution, transport', order: 0 },
      'Architecture Agent': { id: 'architecture', focus: 'Design & layering · coupling, boundaries, follow-up markers', order: 1 },
      'Standards Agent': { id: 'standards', focus: 'Code conventions · debug output, types, declarations', order: 2 },
      'Code Quality Agent': { id: 'quality', focus: 'Reliability & readability · error handling, long lines', order: 3 },
      'AI Context Agent': { id: 'context', focus: 'Project context · guidance-aware review observations', order: 4 }
    };
    const details = knownAgents[name] || {
      id: 'other',
      focus: 'Additional review observations',
      order: knownAgents['AI Context Agent'].order + 1
    };

    return { ...details, name, findings: [] };
  }

  postFindingsToPr(): void {
    this.postingComment = true;
    this.commentError = '';
    this.postedCommentUrl = '';

    this.reviewService.postReviewComment(
      this.review.id,
      this.additionalComment.trim() || undefined
    ).subscribe({
      next: result => {
        this.postedCommentUrl = result.comment_url || '';
        this.postingComment = false;
      },
      error: error => {
        this.commentError = error.error?.detail || 'Could not post findings to GitHub.';
        this.postingComment = false;
      }
    });
  }
}
