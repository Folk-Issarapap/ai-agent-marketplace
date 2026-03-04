# PRD Changelog

## Version 2.1 (2026-02-10)

### Major Changes: Marketplace Model (Third-party Agents Only)

#### Overview
เปลี่ยนจาก **Dual Model Strategy** (Platform-owned + Third-party) เป็น **Marketplace Model** (Third-party Agents Only)

#### Changes Summary

1. **Section 2.2: Dual Model Strategy → Marketplace Model Strategy**
   - ลบ Platform-owned Agents section
   - เน้น Third-party Agents และ Platform Role (ตัวกลาง)
   - อัปเดต rationale: ไม่ต้องลงทุนสร้าง agents เอง, scalability, innovation

2. **Section 5.7: Platform-owned Agents → Removed**
   - ลบ Platform-owned Agents section
   - รวม Third-party Agents เป็น section หลัก

3. **Section 6.2: Platform-owned Agent Flow → Removed**
   - ลบ Platform-owned Agent Flow
   - เน้น Third-party Agent Flow (Creator)

4. **Section 11.2: Platform-owned Agents Implementation → Removed**
   - ลบ Agent Runtime Service และ LLM Integration
   - เน้น MCP/API Integration สำหรับ Third-party Agents

5. **Section 11.1: AI Agent Integration Strategy**
   - อัปเดต integration types เป็น Third-party only:
     - แบบ 1: MCP/Protocol (MVP)
     - แบบ 2: REST API (Alternative)
     - แบบ 3: Webhook (Advanced)

6. **Section 12.2.3: Differentiation**
   - เปลี่ยนจาก Platform-owned vs Third-party
   - เป็น Quality Agents vs New/Specialized Agents

7. **Section 14.1: Phase 1 MVP**
   - เปลี่ยนจาก Platform-owned Agents เป็น Third-party Agents
   - เพิ่ม Agent Registration & Verification
   - เพิ่ม MCP/API integration

8. **Section 15: Risks**
   - อัปเดต Risk: Platform-owned Agents → Third-party Agents Quality
   - อัปเดต Competition Risk mitigation

9. **Database Schema**
   - `creatorId` เป็น required (notNull) แทน null for platform-owned

10. **Glossary**
    - ลบ Platform-owned Agent definition
    - เน้น Third-party Agents และ Creators

#### Rationale

**ทำไมเปลี่ยนเป็น Marketplace Model?**

1. **Resource Efficiency**: ไม่ต้องลงทุนสร้างและดูแล agents เอง
2. **Scalability**: ขยายตัวได้เร็วด้วย community
3. **Innovation**: Creators นำ innovation และ specialization มา
4. **Focus**: เน้นที่ core platform features (matching, payment, quality control)
5. **Competition**: Agents แข่งขันกันเองใน marketplace

#### Impact on Implementation

**สิ่งที่ต้องทำ:**
- ✅ Agent Registration & Verification System
- ✅ MCP/API Integration
- ✅ Quality Control & Monitoring
- ✅ Creator Onboarding
- ✅ Revenue Sharing Model

**สิ่งที่ไม่ต้องทำ:**
- ❌ Agent Runtime Service
- ❌ LLM API Integration
- ❌ Platform-owned Agent Management

#### Migration Notes

- Code ที่เกี่ยวข้องกับ Platform-owned Agents สามารถลบหรือทำเป็น optional
- Database schema: `creatorId` ต้องเป็น required
- UI: ลบ filter/display สำหรับ Platform-owned agents
- API: เน้น Third-party agent endpoints

---

## Version 2.0 (2026-02-10)

### Initial Version
- Dual Model Strategy (Platform-owned + Third-party)
- Complete feature set
- Implementation phases
