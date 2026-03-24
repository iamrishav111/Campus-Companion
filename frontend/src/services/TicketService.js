import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

/**
 * TicketService - Centralized Object-Oriented Service for Campus Companion operations.
 * Encapsulates data fetching, mapping, constants, and exports to ensure scalability.
 * 
 * Logic is strictly preserved from the original dashboards with added null-safety.
 */
class TicketService {
    constructor() {
        this.API_BASE = 'https://campus-companion-backend-nk3b.onrender.com';
        
        this.BLOCKS = ['B26', 'B27', 'B29', 'B30', 'LH'];
        this.CATEGORIES = [
            'AC', 'Electrical', 'Washroom Issues', 'Water Dispenser', 
            'Washing Machine', 'Cleaning', 'WiFi', 'Vending Machine', 
            'Geyser', 'Oven', 'Fridge', 'Furniture', 'Other'
        ];
    }

    /**
     * Maps raw API data to the application's Domain Model.
     * Uses optional chaining and nullish coalescing for maximum robustness.
     */
    mapApiTicket(data) {
        if (!data) return null;

        const rawId = String(data.id || '');
        const shortId = rawId ? rawId.substring(0, 8).toUpperCase() : 'UNKNOWN';
        
        const mappedCategory = this.getCategory(data.category);
        
        // Robust block matching
        const rawBlock = data.hostel_building || (data.room ? String(data.room).split(' ')[0] : '');
        const normalizedBlock = rawBlock ? String(rawBlock).toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

        const description = data.description || '';
        const room = data.room || 'NA';

        return {
            id: shortId, // Used for display in Admin table
            raw_id: rawId, // Exact backend ID
            category: mappedCategory,
            summary: `${this.toSentenceCase(description)} in ${room}`,
            status: data.status || 'Open',
            assigned_to: data.assigned_to || this.getAssignedTech(mappedCategory),
            sla_deadline: data.created_at ? dayjs(data.created_at).add(4, 'hour').toISOString() : dayjs().add(2, 'hour').toISOString(),
            created_at: data.created_at || new Date().toISOString(),
            urgency: data.priority ? this.toSentenceCase(data.priority) : 'Medium',
            room: room,
            hostel_building: this.isValidBlock(normalizedBlock) ? normalizedBlock : '',
            description: description,
            resolved_time_hours: data.status === 'Closed' ? 2 : null,
            admin_notes: data.admin_comment || '',
            contact_number: data.phone && String(data.phone).trim() ? String(data.phone).substring(2) : 'NA',
            student_name: data.name && String(data.name).trim() ? this.toSentenceCase(data.name) : 'Anonymous'
        };
    }

    getCategory(rawCat) {
        if (!rawCat) return 'Other';
        const lower = String(rawCat).toLowerCase();
        if (lower.includes('cleaning')) return 'Cleaning';
        if (lower.includes('wash_mach') || lower.includes('washing')) return 'Washing Machine';
        if (lower.includes('vending')) return 'Vending Machine';
        if (lower.includes('geyser')) return 'Geyser';
        if (lower.includes('oven')) return 'Oven';
        if (lower.includes('fridge')) return 'Fridge';
        if (lower.includes('water_disp') || lower.includes('dispenser') || lower.includes('cooler')) return 'Water Dispenser';
        if (lower.includes('washroom') || lower.includes('plumbing') || lower.includes('leak')) return 'Washroom Issues';
        if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) return 'WiFi';
        if (lower.includes('ac') || lower.includes('air_cond')) return 'AC';
        if (lower.includes('electrical') || lower.includes('light') || lower.includes('fan')) return 'Electrical';
        if (lower.includes('furniture') || lower.includes('bed') || lower.includes('chair') || lower.includes('table')) return 'Furniture';
        if (lower.includes('elevator') || lower.includes('lift')) return 'Electrical';
        return 'Other';
    }

    getAssignedTech(mappedCategory) {
        switch (mappedCategory) {
            case 'AC': return 'Tech 01 (AC)';
            case 'Electrical': return 'Tech 02 (Electrical)';
            case 'Washroom Issues': return 'Tech 03 (Washroom Issues)';
            case 'Water Dispenser': return 'Tech 04 (Water Dispenser)';
            case 'Washing Machine': return 'Tech 05 (Washing Machine)';
            case 'Cleaning': return 'Tech 06 (Cleaning)';
            case 'WiFi': return 'Tech 07 (WiFi)';
            case 'Vending Machine': return 'Tech 08 (Vending Machine)';
            case 'Geyser': return 'Tech 09 (Geyser)';
            case 'Oven': return 'Tech 10 (Oven)';
            case 'Fridge': return 'Tech 11 (Fridge)';
            case 'Furniture': return 'Tech 12 (Furniture)';
            default: return `Tech 00 (${mappedCategory})`;
        }
    }

    isValidBlock(block) {
        if (!block) return false;
        const b = String(block).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        return this.BLOCKS.includes(b);
    }

    toSentenceCase(str) {
        if (!str) return '';
        const s = String(str);
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    async fetchTickets() {
        try {
            const response = await fetch(`${this.API_BASE}/tickets`);
            if (!response.ok) return [];
            const data = await response.json();
            if (!Array.isArray(data)) return [];
            return data.map(t => this.mapApiTicket(t)).filter(t => t !== null);
        } catch (error) {
            console.error("TicketService: Fetch failed", error);
            return [];
        }
    }
}

export default new TicketService();
