# Review & Approval Process

## Overview
เอกสารนี้อธิบาย process ของ Review & Approval สำหรับ jobs ที่อยู่ในสถานะ `in_review`

## Current Status Flow

```
active → in_review → completed (approve)
                      ↘ rejected (reject)
                      ↘ revision_requested (request revision)
```

## Process Details

### 1. Approve Process (in_review → completed)

**Current Implementation:**
- ✅ Status transition: `in_review` → `completed`
- ✅ Set `completedAt` timestamp
- ✅ Log action in `job_logs`
- ❌ **Missing**: Payment processing
- ❌ **Missing**: Locked budget management
- ❌ **Missing**: Agent rating update

**Should Do:**
1. Update job status to `completed`
2. **Process Payment:**
   - Calculate actual cost (based on usage or task)
   - Deduct from wallet
   - Release remaining locked budget
   - Update locked budget status to `used`
3. **Update Agent Rating:**
   - Calculate new rating based on job completion
   - Update agent's average rating
4. **Create Review Record:**
   - Allow user to leave rating/review (optional, can be done later)
5. **Log Transaction:**
   - Record payment transaction
   - Record budget release

### 2. Reject Process (in_review → rejected)

**Current Implementation:**
- ✅ Status transition: `in_review` → `rejected`
- ✅ Log rejection reason
- ❌ **Missing**: Locked budget release
- ❌ **Missing**: Agent rating impact

**Should Do:**
1. Update job status to `rejected`
2. **Release Locked Budget:**
   - Release full locked budget back to wallet
   - Update locked budget status to `released`
   - Set `releasedAt` timestamp
3. **Update Agent Rating:**
   - Record rejection (may impact agent rating negatively)
4. **Log Transaction:**
   - Record budget release transaction

### 3. Request Revision Process (in_review → revision_requested)

**Current Implementation:**
- ✅ Status transition: `in_review` → `revision_requested`
- ✅ Log revision feedback
- ❌ **Missing**: Increment `revisionCount`
- ❌ **Missing**: Check `maxRevisions` limit
- ❌ **Missing**: Validation for revision limit

**Should Do:**
1. **Validate Revision Limit:**
   - Check if `revisionCount < maxRevisions`
   - If limit reached, only allow Approve or Reject
2. **Update Revision Count:**
   - Increment `revisionCount` by 1
   - Store revision feedback in job logs
3. **Update Status:**
   - Change status to `revision_requested`
   - Agent will work on revision → status becomes `active` → then `in_review` again
4. **Keep Budget Locked:**
   - Budget remains locked (not released)
   - Will be processed when finally approved or rejected

## Implementation Checklist

### High Priority (Required for MVP)
- [ ] Add `revisionCount` increment in `requestJobRevision`
- [ ] Add revision limit validation in UI and backend
- [ ] Create payment processing service/hook for approve
- [ ] Create budget release service/hook for reject
- [ ] Update locked budget status when approve/reject

### Medium Priority (Important for Production)
- [ ] Implement actual cost calculation logic
- [ ] Add wallet transaction recording
- [ ] Add agent rating update logic
- [ ] Add review/rating UI after completion
- [ ] Add email/notification when job status changes

### Low Priority (Nice to Have)
- [ ] Add revision history display
- [ ] Add payment breakdown display
- [ ] Add dispute resolution flow
- [ ] Add analytics for approval/rejection rates

## Database Schema Requirements

### Jobs Table
- ✅ `revisionCount` - already exists
- ✅ `maxRevisions` - already exists
- ✅ `status` - already exists
- ✅ `output` - already exists

### Locked Budget Table
- ✅ `status` - already exists (locked | released | used)
- ✅ `amount` - already exists
- ✅ `usedAmount` - already exists
- ✅ `releasedAt` - already exists

### Missing/To Be Created
- [ ] Payment transactions table (if not exists)
- [ ] Reviews table (check if exists and properly linked)

## API/Service Layer Requirements

### JobService Extensions Needed
```typescript
// Should add:
- approveJobWithPayment(jobId, actualCost)
- rejectJobWithBudgetRelease(jobId)
- requestRevisionWithCount(jobId, feedback)
```

### Payment Service Needed
```typescript
// Should create:
- processJobPayment(jobId, amount)
- releaseLockedBudget(jobId, reason)
- calculateJobCost(jobId) // based on usage or task
```

## UI/UX Requirements

### Current UI Status
- ✅ Review & Approval section with clear actions
- ✅ Approve dialog with information
- ✅ Reject dialog with reason input
- ✅ Revision dialog with feedback input
- ✅ Revision count display
- ✅ Revision limit warning

### Missing UI Features
- [ ] Payment breakdown display after approve
- [ ] Budget release confirmation after reject
- [ ] Revision history timeline
- [ ] Rating/review form after completion
- [ ] Success/error notifications with details

## Testing Scenarios

### Test Cases Needed
1. **Approve Flow:**
   - Approve job with sufficient wallet balance
   - Approve job with insufficient balance (should fail)
   - Verify payment deduction
   - Verify budget release
   - Verify status change

2. **Reject Flow:**
   - Reject job and verify budget release
   - Verify status change
   - Verify rejection reason is logged

3. **Revision Flow:**
   - Request revision within limit
   - Request revision at limit (should show warning)
   - Request revision over limit (should be disabled)
   - Verify revision count increment
   - Verify status transition

4. **Edge Cases:**
   - Multiple rapid approvals (idempotency)
   - Network failures during payment
   - Concurrent status updates
   - Invalid status transitions

## Next Steps

1. **Immediate (This Sprint):**
   - Add `revisionCount` increment logic
   - Add revision limit validation
   - Create payment processing stub (can use mock for now)

2. **Short Term (Next Sprint):**
   - Implement actual payment processing
   - Implement budget release
   - Add wallet integration

3. **Medium Term:**
   - Add rating system
   - Add review UI
   - Add notifications

4. **Long Term:**
   - Add analytics
   - Add dispute resolution
   - Add advanced payment options
