const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    default: null
  },
  // Optional Lucide React icon name to render in the catalog tile.
  icon: {
    type: String,
    default: null,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Cyrillic → Latin transliteration so Ukrainian-named categories get a valid
// URL-safe slug instead of collapsing to an empty string (which breaks the
// unique index after the first non-Latin category).
const CYR_MAP = {
  а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',
  ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'iu',я:'ia',
};

function slugifyName(name) {
  if (!name) return '';
  const transliterated = name
    .toLowerCase()
    .split('')
    .map(ch => (CYR_MAP[ch] !== undefined ? CYR_MAP[ch] : ch))
    .join('');
  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

categorySchema.pre('save', async function(next) {
  if (this.slug) return next();

  let base = slugifyName(this.name) || 'category';
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await this.constructor
      .findOne({ slug: candidate })
      .select('_id')
      .lean();
    if (!existing || existing._id.equals(this._id)) break;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Category', categorySchema);
