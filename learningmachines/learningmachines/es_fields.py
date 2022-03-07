ES_FIELDS = {
    'index': {
        'SEC_Texts': 'sec_texts',
        'China_news' : 'china_newstranscripts',
        'Care_Reviews':'care_reviews',
        'caselaw_env':'caselaw_env',
        'Covid':'covid_v4',
        'Pubmed': 'pubmed_v3',
        'PMC': 'pmc_test',
        'JSTOR': 'jstor',
        'foster': 'foster_care_note',
        'foster_encounter': 'foster_care_encounter',
        'CaseLaw': 'case_law',
        'Archaeology': 'archaeology',
        'Latin': 'latin',
        'Ehealth': 'alzheimer_threads',
        'TCP': 'tcp',
        'ACJ': 'ac_justice',
        'AA': 'anesthesiology',
        'CaseLaw_v2': 'case_law_v2',
        'CCHMC' : 'cchmc_notes',
        'TED' : 'ted_talks',
        'Pulmonary' : 'pulmonary_notes',
        'Ehealth_Threads': 'alzheimer_threads', 
        'Cannabis_News':'cannabis',
        'NPO_taxforms':'npo_990forms',
        'OHNPO_taxforms': 'ohio_npo_essential',
        'Pubmed_COI': 'coi_statements',
        'Reddit' : 'parenting_subreddit', 
        'SAA_Abstracts': 'arch_abstracts',
        'Med_Applications': 'family_medicine',
        'Mayerson' : 'mayerson',
        'Mayerson_qna' : 'mayerson_qna',
        'hathitrust_novels' : 'hathitrust_novels',
        'early_modern':'early_modern', 
        'NYNPO_taxforms': 'nynpo_taxforms'
    },
    'id': {
        'SEC_Texts': 'id',
        'China_news' : 'id',
        'Care_Reviews':'UUID',
        'caselaw_env':'id',
        'Covid':'paper_id',
        'Pubmed': 'PMID',
        'PMC': 'PMCID',
        'JSTOR': 'JSTOR_ID',
        'foster': 'NOTE_ID',
        'foster_encounter': 'NOTE_ID',
        'CaseLaw': 'CaseID',
        'Archaeology': 'ArticleID',
        'Latin': 'ArticleID',
        'Ehealth': 'id',
        'TCP': 'TCPID',
        'ACJ': 'Pid',
        'AA': 'SID',
        'CaseLaw_v2': 'CaseID',
        'CCHMC' : 'NoteID',
        'TED' : 'Talk_ID',
        'Pulmonary': 'NoteID',
        'Ehealth_Threads': 'id',
        'Cannabis_News':'id', 
        'NPO_taxforms':'id',
        'OHNPO_taxforms':'id',
        'Pubmed_COI': 'pmid',
        'Reddit' : 'ID',
        'SAA_Abstracts': 'id', 
        'Med_Applications': 'id',
        'Mayerson' : 'case_num',
        'Mayerson_qna' : 'case_no',
        'hathitrust_novels' : 'id',
        'early_modern' : 'id', 
        'NYNPO_taxforms': 'ein' 
    },
    'abstract': {
        'SEC_Texts': 'title',
        'China_news' : 'description',
        'Care_Reviews':'reviewText',
        'caselaw_env':'title',
        'Covid':'abstract',
        'Pubmed': 'AbstractText',
        'PMC': 'Abstract',
        'JSTOR': 'FullText',
        'CaseLaw': 'FullText',
        'Archaeology': 'FullText',
        'Latin': 'FullText',
        'Ehealth': 'text',
        'TCP': 'FullText',
        'ACJ': 'FullText',
        'AA': 'Abstract',
        'CaseLaw_v2': 'FullText',
        'CCHMC' : 'FullText',
        'TED' : 'FullText',
        'Pulmonary': 'FullText',
        'Ehealth_Threads': 'text', 
        'Cannabis_News':'text', 
        'NPO_taxforms':'text',
        'OHNPO_taxforms': 'text', 
        'Pubmed_COI': 'coi',
        'Reddit' : 'FullText',
        'SAA_Abstracts': 'text',
        'Med_Applications': 'text',
        'Mayerson' : 'text',
        'Mayerson_qna' : 'text',
        'hathitrust_novels' : 'page_tokens',
        'early_modern' : 'text', 
        'NYNPO_taxforms': 'text'
    },
    'full_text': {
        'SEC_Texts': 'text',
        'China_news' : 'text',
        'Care_Reviews':'reviewText',
        'caselaw_env':'text',
        'Covid':'fullText',
        'Pubmed': 'AbstractText',
        'PMC': 'FullText',
        'JSTOR': 'FullText',
        'foster': 'HPI_SOCIAL_HISTORY',
        'foster_encounter': 'HPI_SOCIAL_HISTORY',
        'CaseLaw': 'FullText',
        'Archaeology': 'FullText',
        'Latin': 'FullText',
        'Ehealth': 'text',
        'TCP': 'FullText',
        'ACJ': 'FullText',
        'AA': 'Abstract',
        'CaseLaw_v2': 'FullText',
        'CCHMC' : 'FullText',
        'TED' : 'FullText',
        'Pulmonary': 'FullText',
        'Ehealth_Threads': 'text',
        'Cannabis_News':'text', 
        'NPO_taxforms':'text',
        'OHNPO_taxforms':'text',
        'Pubmed_COI': 'coi',
        'Reddit' : 'FullText',
        'SAA_Abstracts': 'text', 
        'Med_Applications': 'text',
        'Mayerson' : 'text',
        'Mayerson_qna' : 'text',
        'hathitrust_novels' : 'page_tokens',
        'early_modern' : 'text', 
        'NYNPO_taxforms': 'text'

    },
    'doc_title' :
        {
        'SEC_Texts': 'title',
        'china_newstranscripts' : 'title',
        'China_news' : 'title',
        'Care_Reviews':'doc_title',
        'caselaw_env':'title',
        'Covid': 'title',
        'Pubmed': 'ArticleTitle',
        'PMC': 'ArticleTitle',
        'JSTOR': 'ArticleTitle',
        'foster': 'PAT_ID',
        'foster_encounter': 'PAT_ID',
        'CaseLaw': 'Name',
        'Archaeology': 'ArticleTitle',
        'Latin': 'ArticleTitle',
        'Ehealth': 'TopicID',
        'TCP': 'ArticleTitle',
        'ACJ': 'ArticleTitle',
        'AA': 'ArticleTitle',
        'CaseLaw_v2': 'Name',
        'CCHMC' : 'NoteID',
        'TED' : 'Name',
        'Pulmonary': 'NoteID',
        'Cannabis_News': 'link', 
        'Pubmed_COI': 'article',
        'Reddit' : 'ID',
        'NPO_taxforms': 'id',
        'OHNPO_taxforms': 'id',
        'SAA_Abstracts': 'id', 
        'Med_Applications': 'title',
        'Mayerson' : 'case_num',
        'Mayerson_qna' : 'case_no',
        'hathitrust_novels' : 'title',
        'early_modern' : 'title', 
        'NYNPO_taxforms': 'title'

        },
    'author' :
        {
        'SEC_Texts': 'title',
        'China_news' : 'program',
        'Care_Reviews':'dataSource',
        'caselaw_env':'URL',
        'Covid': 'authors',
        'PMC': 'ArticleTitle',
        'JSTOR': 'Authors',
        'TCP': 'Authors',
        'AA': 'Authors',
        'TED' : 'Speaker_1',
        'Pubmed_COI': 'authors',
        'Reddit' : 'ID',
        'Cannabis_News': 'title', 
        'Mayerson' : 'interviewer',
        'Mayerson_qna' : 'interviewer',
        'hathitrust_novels' : 'author',
        'early_modern' : 'author', 
        'NYNPO_taxforms': 'title'
        },
    'date': {
        'SEC_Texts': 'date',
        'China_news' : 'date',
        'Care_Reviews':'reviewDate',
        'caselaw_env':'date',
        'Covid':'date',
        'Pubmed': 'ReleaseDate',
        'PMC': 'ReleaseDate',
        'JSTOR': 'ReleaseDate',
        'foster': 'TODO',
        'CaseLaw': 'DecisionDate',
        'Archaeology': 'ReleaseDate',
        'Latin': 'No_date',
        'Ehealth': 'date',
        'TCP': 'PubDate',
        'ACJ': 'PubDate',
        'AA': 'Date',
        'CaseLaw_v2': 'DecisionDate',
        'CCHMC' : 'NoteDate',
        'TED' : 'PubDate',
        'Pulmonary': 'NoteDate',
        'Ehealth_Threads': 'date', 
        'Cannabis_News':'date', 
        'NPO_taxforms':'date',
        'OHNPO_taxforms': 'date',
        'Cannabis_News':'date',
        'Pubmed_COI': 'pub_year',
        'Reddit' : 'Date',
        'SAA_Abstracts': 'date', 
        'Med_Applications': 'date',
        'Mayerson' : 'file_date',
        'Mayerson_qna' : 'file_date',
        'hathitrust_novels' : 'date',
        'early_modern' : 'date', 
        'NYNPO_taxforms': 'date'
    },
    'doc_type': {
        'foster': 'note',
        'foster_encounter': 'note'
    },
    'info': {
        'SEC_Texts': ['title', 'date'],
        'china_newstranscripts' : ['title', 'date', 'program'],
        'China_news' : ['title', 'date', 'program'],
        'Care_Reviews':['businessTitle','dataSource','directURL'],
        'caselaw_env':['case_ID','title', 'date'],
        'Covid':['paper_id','bib_entries','authors'],
        'Pubmed': ['PMID', 'ReleaseDate'],
        'PMC': ['ID', 'Journal', 'Pub Date', 'Authors'],
        'JSTOR': ['ID', 'Journal', 'Pub Date', 'Authors'],
        'foster': ['TODO'],
        'CaseLaw': ['ID', 'Date'],
        'Ehealth': ['id', 'date'],
        'TCP': ['ID', 'PubDate', 'Authors'],
        'ACJ': ['ID', 'PubDate'],
        'CaseLaw_v2': ['ID', 'Date'],
        'CCHMC' : ['NoteID','NoteDate'],
        'TED' : ['Talk_ID', 'PubDate'],
        'Pulmonary':['NoteID', 'NoteDate'],
        'Ehealth_Threads': ['id', 'date'], 
        'Cannabis_News':['id', 'date'],
        'NPO_taxforms':['id', 'date'],
        'OHNPO_taxforms':['id', 'date'],
        'Cannabis_News':['id', 'date'], 
        'Pubmed_COI': ['pmid','journal', 'authors'],
        'Reddit' : ['ID', 'Date'],
        'SAA_Abstracts': ['id', 'date'], 
        'Med_Applications': ['id', 'date'],
        'Mayerson' : ['case_num', 'file_date'],
        'Mayerson_qna' : ['case_no', 'file_date'],
        'hathitrust_novels' : ['title', 'date'],
        'early_modern' : ['title', 'date'],
        'NYNPO_taxforms': ['title', 'date']
    }
}
MAX_NUM_DOC_VIS = {

    'SEC_Texts': 22000,
    'china_newstranscripts' : 189000,
    'China_news' : 189000,
    'Care_Reviews': 30000,
    'caselaw_env':121000,
    'Covid': 144000,
    'Pubmed': 2000000,
    'PMC': 20000,
    'JSTOR': 4000,
    'foster': 10000,
    'CaseLaw': 6000,
    'Archaeology': 5000,
    'Latin': 20000,
    'Ehealth': 20000,
    'TCP': 1500,
    'ACJ': 20000,
    'searchpage' : 144000,
    'CaseLaw_v2' : 10000,
    'AA' : 23000,
    'CCHMC' : 20000,
    'TED' : 20000,
    'Pulmonary': 20000,
    'Ehealth_Threads': 20000,
    'Cannabis_News': 15000, 
    'NPO_taxforms': 20000,
    'OHNPO_taxforms': 10000,
    'Cannabis_News': 14000,
    'Pubmed_COI': 20000,
    'Reddit' : 50000,
    'SAA_Abstracts': 20000, 
    'Med_Applications': 4000,
    'Mayerson' : 20000,
    'Mayerson_qna' : 20000,
    'hathitrust_novels' : 2000,
    'early_modern' : 6000, 
    'NYNPO_taxforms': 45000
}