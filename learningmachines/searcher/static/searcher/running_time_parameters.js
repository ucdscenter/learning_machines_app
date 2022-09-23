/*,a,b
Pubmed,0.0127,13.8
PMC,0.0236,20
JSTOR,0.286,0
CaseLaw,0.184,0
Archeology,0.417,0
Latin,,
Ehealth,0.013,0.7
TCP,0.728,0
ACJ,0.036,0.3*/
/*
Pubmed  20000
PMC 20000
JSTOR   4000
CaseLaw 6000
Archaeology 2500
Latin   
Ehealth 20000
TCP 1500
ACJ 20000*/

var database_runtimes = {

  	'Poetry_Foundation' : {
		"a" : 0,
		"b" : 0,
		"count" : 15652,
		"max" : 15652,
		"description" : "Dataset containing most poems found on poetryfoundation.org"
  	},
	'News_Articles' : {
		"a" : 0,
   		"b" : 0,
   		"count" : 2688879,
   		"max" : 22000,
   		"description" : "News articles and essays dataset from 27 Amer ican publications"
	},

   	'SEC_Texts' : {
   		"a" : 0,
   		"b" : 0,
   		"count" : 21386,
   		"max" : 22000,
   		"description" : "SEC Filings for a specific project"
   	},

   	"China_news" : {
   		"a" : 0,
   		"b" : 0,
   		"count" : 188641,
   		"max" : 199000,
   		"description" : "Articles mentioning china"
   	},
   	"caselaw_env" : {
	"a" : 0,
	"b" : 0,
	"count" : 120859,
	"max" : 121000,
	"description" : "Caselaw Dataset containing relevant filings to environmental terms"
	},
	"Care_Reviews" : {
	"a" : 0,
	"b" : 0,
	"count" : 33316,
	"max" : 30000,
	"description" : "Google reviews for select emergency rooms in the United States"
	},
	"Covid" : {
	"a" : 0.0127,
	"b" : 1.8,
	"count" : 13202,
	"max" : 30000,
	"description" : "CDC Dataset of articles related to COVID"
	},
	"Pubmed" : {
	"a" : 0.0127,
	"b" : 13.8,
	"count" : 29354746,
	"max" : 20000,
	"description" : "All Pubmed article abstracts up until 2017"
	},
	"PMC" : {
	"a" : 0.0236,
	"b" : 20,
	"count" : 2154226,
	"max" : 20000,
	"description" : "Sampling of Pubmed Central full articles"
	},
	"JSTOR" : {
	"a" : 0.286,
	"b" : 0,
	"count" : 825268,
	"max" : 4000,
	"description" : "Articles specifically related to Plant Genetics"
	},
	"CaseLaw" : {
	"a" : 0.184,
	"b" : 0, 
	"count" : 412521,
	"max" : 100000,
	"description" : "Caselaw data, from the Caselaw Access Project?"
	},

	"Archaeology" : {
	"a" : 0.417,
	"b" : 0,
	"count" : 2385,
	"max" : 5000,
	"description" : "Archaeology Journal articles from Latin American Antiquity & Ancient Mesoamerica"
	},
	"Latin" : {
	"a" : 0,
	"b" : 0,
	"count" : 2979,
	"max" : 20000,
	"description" : "Documents from the Iowa Latin Cannon Dataset"
	},
	"Ehealth" : {
	"a" : 0.013,
	"b" : .7,
	"count" : 129,
	"max" : 20000,
	"description" : "Threads from public questions on Alzheimers"
	},
	"TCP" : {
	"a" : 0.728,
	"b" : 0,
	"count" : 69922,
	"max" : 1500,
	"description" : "Full-text transcriptions of early print booksfrom the Text Creation Partnership"
	},
	"ACJ" : {
	"a" : 0.036,
	"b" : 0.3,
	"count" : 297,
	"max" : 20000,
	"description" : "No description yet!"
	}, 
	"AA" : {
	"a" : 0,
	"b" : 0,
	"count" : 28016,
	"max" : 23000,
	"description" : "Abstracts related to Anesthesiology research."
	},
	"CaseLaw_v2" : {
	"a" : 0.184,
	"b" : 0, 
	"count" : 324998,
	"max" : 100000,
	"description" : "More Caselaw!"
	},
	"CCHMC" : {
	"a" : 0,
	"b" : 0, 
	"count" : 1279,
	"max" : 20000,
	"description" : "No description yet"
	},
	"TED" : {
	"a" : 0,
	"b" : 0, 
	"count" : 992,
	"max" : 20000,
	"description" : "Transcriptions of Ted Talks"
	}, 
	"Pulmonary" : {
	"a" : 0,
	"b" : 0, 
	"count" : 22711,
	"max" : 20000,
	"description" : "No description yet"
	},
	"Ehealth_Threads" : {
	"a" : 0,
	"b" : 0, 
	"count" : 129,
	"max" : 20000,
	"description" : "test thing!"
	},
	"Cannabis_News" : {
	"a" : 0,
	"b" : 0, 
	"count" : 13880,
	"description" : "OCR tran"
	},
	"Reddit" : {
	"a" : 0,
	"b" : 0, 
	"count" : 36698,
	"max" : 37000,
	"description" : "reddit comments from the /r/parenting subreddit"
	},
	"Pubmed_COI" : {
	"a" : 0,
	"b" : 0, 
	"count" : 427374,
	"max" : 20000
	,"description" : "Pubmed articles with an first-author country of origin"
	}, 
	"NPO_taxforms" : {
	"a" : 0,
	"b" : 0, 
	"count" : 173341,
	"max" : 20000,
	"description" : "New york tax forms"
	},
	"OHNPO_taxforms": {
	"a" : 0,
	"b" : 0, 
	"count" : 5316,
	"max" : 10000,
	"description" : "Ohio tax forms"
	},
	"SAA_Abstracts" : {
	"a" : 0,
	"b" : 0, 
	"count" : 8095,
	"max" : 20000,
	"description" : "test thing!"
	}, 
	"Med_Applications" : {
	"a" : 0,
	"b" : 0, 
	"count" : 3577,
	"max" : 4000,
	"description" : "Selected medical school application essays"
	},
	"Mayerson" : {
	"a" : 0,
	"b" : 0, 
	"count" : 53,
	"max" : 4000,
	"description" : "No description yet"
	},
	"Mayerson_qna" : {
	"a" : 0,
	"b" : 0, 
	"count" : 7672,
	"max" : 8000,
	"description" : "No description yet"
	},
	"early_modern" : {
	"a" : 0, 
	"b" : 0,
	"count" : 4959,
	"max" : 6000,
	"description" : "Jstor articles from early modernism"
	},
	"NYNPO_taxforms" : {
	"a" : 0, 
	"b" : 0,
	"count" : 44309,
	"max" : 45000,
	"description" : "No description yet"
	},
	'Hathi_Climate' : {
	"a" : 0, 
	"b" : 0,
	"count" : 4556,
	"max" : 5000,
	"description" : "Pages of word-buckets related to climate terms in 20th century novels"
	},
    'Hathi_Rand' : {
	"a" : 0, 
	"b" : 0,
	"count" : 4974,
	"max" : 5000,
	"description" : "Random pages of word-buckets related to climate terms in 20th century novels"
	},
	'NYT_China' : {
	"a" : 0, 
	"b" : 0,
	"count" : 79923,
	"max" : 80000,
	"description" : "New York times articles mentioning China"
	},
	'WSJ_China' : {
	"a" : 0,
	"b" : 0,
	"count" : 30415,
	"max" : 31000,
	"description" : "Washington Journal articles mentioning China"
	},
	'WAPO_China' : {
	"a" : 0,
	"b" : 0,
	"count" : 9596,
	"max" : 10000,
	"description" : "Washington Post articles mentioning China"
	}
}
