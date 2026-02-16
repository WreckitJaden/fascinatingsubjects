#!/usr/bin/env node
/**
 * One-off seed for data/reading-list.json from Reading List.md content.
 * Run from repo root: node scripts/seed-reading-list.mjs
 * Writes to data/reading-list.json (commit and push so GitHub has it).
 */
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "data", "reading-list.json");

const categories = [
  {
    id: "biographies",
    name: "Biographies & Autobiographies / Historical Figures",
    books: [
      { title: "Team of Rivals: The Political Genius of Abraham Lincoln", url: "https://www.amazon.ca/Team-Rivals-Political-Abraham-Lincoln/dp/0743270754/ref=asc_df_0743270754?mcid=27a7873265133904bea0462b508f3d61&tag=googleshopc0c-20&linkCode=df0&hvadid=706755773236&hvpos=&hvnetw=g&hvrand=12648945293134041147&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-435046582760&psc=1&gad_source=1" },
      { title: "Andy Grove (Intel CEO)", url: "https://www.amazon.ca/gp/product/1591841399/ref=ox_sc_saved_image_4?smid=A3VSITRQ8G7B83&psc=1" },
      { title: "Thomas Edison", url: "https://www.amazon.ca/Edison-Edmund-Morris/dp/081299311X/ref=asc_df_081299311X?mcid=f235bb746a3a3dea8db2d52f161a61ac&tag=googleshopc0c-20&linkCode=df0&hvadid=706755773242&hvpos=&hvnetw=g&hvrand=8163443634943866160&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-827593932609&psc=1&gad_source=1" },
      { title: "Warren Buffett", url: "https://www.amazon.ca/Snowball-Warren-Buffett-Business-Life/dp/0553384619/ref=asc_df_0553384619?mcid=2c753fd1982a3b08b5ee13ddbd13fe90&tag=googleshopc0c-20&linkCode=df0&hvadid=706843851320&hvpos=&hvnetw=g&hvrand=15610337468359679087&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-433880134685&psc=1&hvocijid=15610337468359679087-0553384619-&hvexpln=0&gad_source=1" },
      { title: "The Last Lion: Winston Spencer Churchill - William Manchester", url: "https://www.amazon.ca/gp/product/0316227781/ref=ox_sc_act_title_10?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Churchill: Walking with Destiny - Andrew Roberts", url: "https://www.amazon.ca/Churchill-Walking-Destiny-Andrew-Roberts/dp/0141981253/ref=asc_df_0141981253?mcid=1af685b1e8c430c190124f09f3a4f646&tag=googleshopc0c-20&linkCode=df0&hvadid=706745563087&hvpos=&hvnetw=g&hvrand=2848848005447580739&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-816322423424&psc=1&hvocijid=2848848005447580739-0141981253-&hvexpln=0&gad_source=1" },
      { title: "Napolean - V Cronin", url: "https://www.amazon.ca/gp/product/0006375219/ref=ox_sc_act_title_8?smid=A2FFOYUHO1G4GX&psc=1" },
      { title: "A short history of nearly everything- Bill Bryson", url: "https://www.amazon.ca/Short-History-Nearly-Everything/dp/0385660049/ref=mp_s_a_1_1?adgrpid=59632969085&dib=eyJ2IjoiMSJ9.xn-aFvM9hqFG6qgTgdNOanT2X5Qq6drByxKNVQM3hr34oGjt_WmdiigqkN8_aEyUG-hSWhQ8h_iR5HTWk6b6nBLEm7ZtMzGJKFtei4TFFCBV3aDZVngf_2kHig6UmwN1RD7pAOFxzsJbyWtlDmLTVZtQuaVakGrdFszVCoAMcNvSVtfRIdR8_ZO-VOz9XSmSDLZTUd_JQRRxv9OrAc34cw.s9_yXAGPznMgbtmVGmo7gtmBgNN-TOh9JeE7ASnYMZ4&dib_tag=se&gad_source=1&hvadid=668476161764&hvdev=m&hvexpln=0&hvlocphy=9000838&hvnetw=g&hvocijid=17183829975973878006--&hvqmt=e&hvrand=17183829975973878006&hvtargid=kwd-321112110634&hydadcr=25570_13648904&keywords=a+short+history+of+nearly+everything&mcid=3dfd348354e83b249a8938ff290195d5&qid=1762312785&sr=8-1" },
      { title: "Genghis Khan and the Making of the Modern World - Jack Wetherford", url: "https://www.amazon.ca/Genghis-Khan-Making-Modern-World/dp/0609809644/ref=books_/hz/dp/data_desktop_mfs_organic_multientitysimsww_5?_encoding=UTF8&pd_rd_w=IGSIA&content-id=amzn1.sym.f7a27d2c-6502-48f9-be82-d9f89001487a&pf_rd_p=f7a27d2c-6502-48f9-be82-d9f89001487a&pf_rd_r=QQ34Z6W0DG4R8GG6M9MK&pd_rd_wg=R8Fig&pd_rd_r=fcdc0af3-c3c1-477c-8058-41ed5f139b52" },
    ],
  },
  {
    id: "psychology",
    name: "Psychology",
    books: [
      { title: "The Way of Zen - Allan Watts", url: "https://www.amazon.ca/Way-Zen-Alan-W-Watts/dp/0375705104/ref=pd_bxgy_thbs_d_sccl_2/146-7615214-6035761?pd_rd_w=UHfZ0&content-id=amzn1.sym.7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_p=7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_r=20S5YWR6D2YPE46BWQ8S&pd_rd_wg=ick18&pd_rd_r=45cf15c9-ca92-47d2-bec4-f266b16a10d0&pd_rd_i=0375705104&psc=1" },
      { title: "Courage to Create - Rollo May", url: "https://www.amazon.ca/gp/product/0393311066/ref=ox_sc_saved_image_3?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Art of Thinking Clearly - Rob Dobelli", url: "" },
      { title: "The Hero with a Thousand Faces - Joseph Campbell", url: "https://www.amazon.ca/gp/product/1577315936/ref=ox_sc_saved_image_10?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Fight Right - Julie Schwartz Gottman, John Gottman", url: "" },
    ],
  },
  {
    id: "neuroscience",
    name: "Neuroscience",
    books: [
      { title: "Cognitive Neuroscience - MSG", url: "" },
    ],
  },
  {
    id: "cs-ml-ai",
    name: "Computer Science, Machine Learning, and Artificial Intelligence",
    books: [
      { title: "Deep Learning - Yoshua Bengio", url: "" },
      { title: "CODE, The Hidden Language of Computer Hardware and Software", url: "https://www.amazon.ca/gp/product/0735611319/ref=ox_sc_saved_title_1?smid=A1KER9YN12B5KC&psc=1" },
      { title: "Faraday, Maxwell and the Electro Dynamic Field - Nancy Forbes", url: "https://www.amazon.ca/gp/product/1616149426/ref=ox_sc_saved_image_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Electric Universe - David Bodanis", url: "https://www.amazon.ca/gp/product/0307335984/ref=ox_sc_saved_image_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Code Book - Simon Singh", url: "https://www.amazon.ca/gp/product/0385495323/ref=ox_sc_saved_image_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Life of James Clerk Maxwell - Basil Mahon", url: "https://www.amazon.ca/gp/product/0470861711/ref=ewc_pr_img_1?smid=A16QG551YFGVPL&psc=1" },
      { title: "The Making of the Atomic Bomb - Richard Rhodes", url: "https://www.amazon.ca/Making-Atomic-Bomb-25th-Anniversary/dp/1451677618/ref=asc_df_1451677618?mcid=e53e9c86519638cbba07ff8974dda204&tag=googleshopc0c-20&linkCode=df0&hvadid=706759606684&hvpos=&hvnetw=g&hvrand=7204215580060879263&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-497934933037&psc=1&hvocijid=7204215580060879263-1451677618-&hvexpln=0&gad_source=1" },
      { title: "Read Write Own: Building the Next Era of the Internet - Chris Dixon", url: "https://www.amazon.ca/gp/aw/d/0593731387/ref=sw_img_1?smid=A2DSD3885K3CB2&psc=1" },
    ],
  },
  {
    id: "business",
    name: "Business",
    books: [
      { title: "The Effective Executive - Peter Drucker", url: "https://www.amazon.ca/gp/product/0060833459/ref=ox_sc_saved_title_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Memos from the Chairman - Alan C. Greenberg", url: "https://www.amazon.ca/gp/product/1523501324/ref=ox_sc_act_title_18?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Built to Last: Successful Habits of Visionary Companies - Jim Collins", url: "https://www.amazon.ca/gp/product/1523501324/ref=ox_sc_act_title_18?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Rework - Jason Fried", url: "https://www.amazon.ca/gp/product/0307463745/ref=ox_sc_act_title_15?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Dealers of Lightning - Michael A. Hiltzik", url: "https://www.amazon.ca/gp/product/0887309895/ref=ox_sc_act_title_14?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "High-Output Management - Andrew S. Grove", url: "https://www.amazon.ca/gp/product/0394532341/ref=ox_sc_act_title_11?smid=A2NZB76B8TDJAG&psc=1" },
      { title: "The Outsiders: Eight Unconventional CEOs and Their… - William N. Thorndike", url: "https://www.amazon.ca/gp/product/1422162672/ref=ox_sc_act_title_3?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Only the Paranoid Survive - Andrew S. Grove", url: "https://www.amazon.ca/gp/product/0385483821/ref=ox_sc_act_title_2?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Business Adventures: Twelve Classic Tales from the World of Wall Street - John Brooks", url: "https://www.amazon.ca/gp/product/1504000021/ref=ox_sc_act_title_1?smid=A39WG0CDP8YH9O&psc=1" },
      { title: "Inspired - Marty Cagan", url: "https://www.amazon.ca/gp/product/1119387507/ref=ox_sc_act_title_21?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Working Backwards: Insights, Stories and Secrets from Inside Amazon - Colin & Carr Bryar", url: "https://www.amazon.ca/gp/product/1529033845/ref=ox_sc_act_title_22?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Secrets of Sand Hill Road: How to Get Venture Capital - Scott Kupor", url: "https://www.amazon.ca/Secrets-Sand-Hill-Road-Venture/dp/059308358X/ref=mp_s_a_1_1?adgrpid=61157044996&dib=eyJ2IjoiMSJ9.BmLaeCrNCPQEOwIH7b-op2MdniW2xM847KwxYdFzaWbGjHj071QN20LucGBJIEps._Sbv1_FinH7qPRIBLKbQWna7kxJ0mZTYHBY-DWpaXEI&dib_tag=se&gad_source=1&hvadid=602858311186&hvdev=m&hvexpln=0&hvlocphy=9000838&hvnetw=g&hvocijid=15134553720537463961--&hvqmt=e&hvrand=15134553720537463961&hvtargid=kwd-665347203756&hydadcr=14597_13436165&keywords=secrets+of+sand+hill+road&mcid=a669821bb33d367983e68ce7e0c0ccb2&qid=1758634574&sr=8-1" },
      { title: "The Art and Science of Digital Marketing and Advertising - Alex Schultz", url: "https://www.amazon.ca/gp/product/0316597597/ref=ox_sc_act_image_8?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Measure What Matters", url: "" },
    ],
  },
  {
    id: "society",
    name: "Society",
    books: [
      { title: "How the World Really Works (silly, stupid assumption) - Vaclav Smith", url: "https://www.amazon.ca/How-World-Really-Works-Science/dp/0593297067/ref=pd_bxgy_thbs_d_sccl_1/146-7615214-6035761?pd_rd_w=dkCAa&content-id=amzn1.sym.7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_p=7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_r=7WDCEZDHGD2BPPSG3TNB&pd_rd_wg=3WKIO&pd_rd_r=44d10ca0-5034-43b0-a584-067cdcb2746c&pd_rd_i=0593297067&psc=1" },
      { title: "The Death and Life of Great American Cities - Jane Jacobs", url: "https://www.amazon.ca/gp/product/067974195X/ref=ox_sc_act_title_13?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Keeping At It: The Quest for Sound Money and Good Government - Paul A Volcker", url: "https://www.amazon.ca/gp/product/1541788311/ref=ox_sc_act_title_6?smid=A1DK77G0ZBB6YF&psc=1" },
      { title: "S.P.Q.R.: A History of Ancient Rome - Mary Beard", url: "https://www.amazon.ca/S-P-Q-R-History-Ancient-Mary-Beard/dp/1631492225/ref=books_/hz/dp/data_desktop_mfs_organic_multientitysimsww_5?_encoding=UTF8&pd_rd_w=EkruB&content-id=amzn1.sym.f7a27d2c-6502-48f9-be82-d9f89001487a&pf_rd_p=f7a27d2c-6502-48f9-be82-d9f89001487a&pf_rd_r=QHBW3YWF166VQY760V6W&pd_rd_wg=wSCGf&pd_rd_r=5acd51bb-0a9a-4600-a539-4443999537ca" },
      { title: "The Silk Roads: A New History of the World - Peter Frankopan", url: "https://www.amazon.ca/Silk-Roads-New-History-World/dp/1101912375/ref=pd_bxgy_thbs_d_sccl_2/143-2848173-1311826?pd_rd_w=V2gYx&content-id=amzn1.sym.7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_p=7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_r=C38VC4JFWFZ5ZZZXVH4N&pd_rd_wg=2xTlr&pd_rd_r=9e5755a8-bc11-46fd-9762-0a0799ffec5c&pd_rd_i=1101912375&psc=1" },
      { title: "1177 B.C.: The Year Civilization Collapsed - Eric H. Cline", url: "https://www.amazon.ca/1177-B-C-Civilization-Collapsed-Revised/dp/0691208018/ref=books_/hz/dp/data_desktop_mfs_organic_multientitysimsww_2?_encoding=UTF8&pd_rd_w=IGSIA&pd_rd_wg=R8Fig&pd_rd_r=fcdc0af3-c3c1-477c-8058-41ed5f139b52&content-id=amzn1.sym.f7a27d2c-6502-48f9-be82-d9f89001487a" },
      { title: "Abundance - Ezra Klein, Derek Thompson", url: "https://www.amazon.ca/gp/product/1668023482/ref=ewc_pr_img_1?smid=A3DWYIK6Y9EEQB&psc=1" },
    ],
  },
  {
    id: "science",
    name: "Science",
    books: [
      { title: "Six Easy Pieces - Richard Feynman", url: "https://www.thriftbooks.com/w/six-easy-pieces-essentials-of-physics-explained-by-its-most-brilliant-teacher-by-richard-feynman-robert-b-leighton/253373/?resultid=fe262c64-a62a-46d4-8e50-06d3ad3c6c66#edition=4562830&idiq=2454290" },
      { title: "The Golden Ratio - The Divine Beauty of Mathematics", url: "https://www.amazon.ca/gp/product/163106486X/ref=ox_sc_saved_image_7?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Theoretical Minimum", url: "https://www.amazon.ca/gp/product/0465062903/ref=ox_sc_saved_image_6?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Quantum Mechanics - The Theoretical Minimum", url: "https://www.amazon.ca/gp/product/0465062903/ref=ox_sc_saved_image_6?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Structure of Scientific Revolutions - Thomas Kuhn", url: "" },
      { title: "The Logic of Scientific Discovery - Karl Popper", url: "https://www.amazon.ca/Logic-Scientific-Discovery-Karl-Popper/dp/0415278449/ref=asc_df_0415278449?mcid=1d5749127f093773931a2670eae120aa&tag=googleshopc0c-20&linkCode=df0&hvadid=706745562901&hvpos=&hvnetw=g&hvrand=13588466247799660789&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-458132455574&psc=1&hvocijid=13588466247799660789-0415278449-&hvexpln=0&gad_source=1" },
      { title: "The Fabric of Reality - David Deutsch", url: "https://www.amazon.ca/gp/product/014027541X/ref=ox_sc_act_title_5?smid=A12UFBL1JPT2UF&psc=1" },
      { title: "The Beginning of Infinity - David Deutsch", url: "https://www.amazon.ca/Penguin-Classics-Beginning-Infinity-Deutsch/dp/0140278168/ref=pd_bxgy_d_sccl_1/135-3454284-8890132?pd_rd_w=Mx6zR&content-id=amzn1.sym.7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_p=7d247ad0-6617-4ec8-8e24-f03a7b8940a1&pf_rd_r=2772AE7KFTFVWTZN6VNP&pd_rd_wg=YQgyw&pd_rd_r=6a94251b-0b9b-4184-ab69-e32d502008a3&pd_rd_i=0140278168&psc=1" },
      { title: "Engineering in Plain Sight - Grady Hillhouse", url: "https://www.amazon.ca/gp/product/171850232X/ref=ox_sc_act_image_3?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Open Circuits (The Inner Beauty of Electrical Components) - Windell Oskay", url: "https://www.amazon.ca/gp/product/1718502346/ref=ox_sc_act_title_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Information: A History, A Theory, A Flood - James Gleick", url: "https://www.amazon.ca/Information-History-Theory-Flood/dp/1400096235" },
      { title: "Tubes (on the infrastructure of the internet) - Andrew Blum", url: "https://www.amazon.ca/Tubes-Journey-Internet-Andrew-Blum/dp/0061994936" },
      { title: "How to Solve It - George Polya", url: "https://www.amazon.ca/cart/smart-wagon?newItems=35a3de84-9404-4e51-93aa-4def8885c35f,1&ref_=sw_refresh" },
      { title: "The Double Helix: A Personal Account of the Discovery of the Structure of DNA - James D. Watson", url: "https://www.amazon.ca/gp/product/074321630X/ref=ox_sc_saved_image_4?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Godel, Escher, Bach: An Eternal Golden Braid - Douglas R. Hofstadter", url: "" },
    ],
  },
  {
    id: "health",
    name: "Health, Gut Health, Nutrition, Exercise",
    books: [
      { title: "Super Gut - William Davis", url: "https://www.amazon.ca/Super-Gut-Reprogram-Microbiome-Restore/dp/1443465313/ref=sr_1_1?crid=1PCBWGP1DHE9X&dib=eyJ2IjoiMSJ9.D7LwJP9lWRi3eMQv3NNczHm58w2QLdAyWPD2Rkh8y2aY_BCoj0GcokobGaD9gHirJ_unuEdFtpvLM2ypFFlSAz9rm8So2-GY7Co_7MBn3ZgTWidoMwEVIssUyiyWVAb18jGk9MaQvTOsc2p1R6UvP0t-HSqvosaiR76eFK3afDs2OQbfGz9mKlApBy5kUyhtEe5fyv-nh-bbBFS_tRxVeVbpfUZmpRhlswiur0GJHHU.DKl833HltweWMMoDNpy1iOtyui81dpwFQknIoscMijA&dib_tag=se&keywords=william+davis&qid=1763928399&s=books&sprefix=william+davis+%2Cstripbooks%2C129&sr=1-1" },
      { title: "Fiber Fueled - Will Bulsiewicz", url: "https://www.amazon.ca/Fiber-Fueled-Plant-Based-Optimizing-Microbiome/dp/059308456X/ref=sr_1_1?crid=ZWVVO3DL3XGW&dib=eyJ2IjoiMSJ9.xdtCmVCGY-uGIAhFhsNfUibmgfwAIJFb0rVfUC4XbxRoMD1zgCx3sqz9Q9MEqW2ijopLbe2AXmnTBfA-d9h_Xb1T4r4hVHODJaYrtP9x2U0IMhSlxxsOvLlssRZwo4E4wVIjnpy_c6lsM7zWCPk_cDcQPRvJiXZl8iC7Ulhj0A-xEi_kINBsw76JrEjOvYBEXEQg76f6FYtSV8rDoJOD-aqP4IANkBhtfIPSQJ-yHKQ.xrDJHiMYFUX8ZgQfaoJZLWpOHpcUZ6uUENzxRFK_h1E&dib_tag=se&keywords=fiber+fueled&qid=1763928369&s=books&sprefix=fiber+fu%2Cstripbooks%2C201&sr=1-1" },
      { title: "Eat Dirt - Josh Axe", url: "https://www.amazon.ca/Eat-Dirt-Health-Problems-Surprising/dp/0062433679/ref=sr_1_1?crid=2TDP1OLBUIA4D&dib=eyJ2IjoiMSJ9._tPqrjQ8VIVLAEkVESNiHBqvRUCOuI3Ci7zvXtW5lY5_czkLeNLDcZu3HvNpeHRFXLWN9Mews6P10B2QmmRxiZ3vnICZ9avKpBzwl0PwV1hTqr9fAcZ_MJR-T7dQkS5t43n871xcXoUC3_3ZLgRhqYdEw0JmUUrpR5tS4ZcgU27fTJzJ5LvDmO16ixfswct2S5JKDr4wq-wcgHc3pJDNBIA2KXpo6PAzR806X4Z0Y5E.3ggHweJsbbbVdkBgD-R5VJFUsgxrWxrTQmCs3vPud1I&dib_tag=se&keywords=eat+dirt&qid=1763928323&s=books&sprefix=eat+dirt%2Cstripbooks%2C168&sr=1-1" },
      { title: "Brain Maker - David Perlmutter", url: "https://www.amazon.ca/Brain-Maker-Power-Microbes-Protect/dp/0316380105/ref=sr_1_1?crid=7LJI7PFOGRG8&dib=eyJ2IjoiMSJ9.PUfAA8v_7Q5_2cXT38BIEdY8aPYGB-b9Ru5SdmjxQ4r10RvbLEliaqvLIUSfNeRgx2HLNWBk4ay5s5EUg3pDb-ssOrbz8VGRTzJgutxNZAhMiM3mc973ynsB13DvgBDrr4zpzZtpBZJVLRJCeD3ym4STYSqNm96nLqZFOLhS02opRAPHy-nl5fewtn096yPo5fEry8nLpu7k5YVQtPvZgbC-nnu2IhoAFnxCqkLT9gM.tuXiqYbRTWGTJ1Xo8NV-Htwjc-WIqFlcXhzJfC1wEJA&dib_tag=se&keywords=brain+maker&qid=1763928419&s=books&sprefix=brain+make%2Cstripbooks%2C156&sr=1-1" },
      { title: "The Mind-Gut Connection - Emeran Mayer", url: "https://www.amazon.ca/Mind-Gut-Connection-Conversation-Impacts-Choices/dp/0062376586/ref=sr_1_1?crid=32GWMFD1SZQAR&dib=eyJ2IjoiMSJ9.zpyDg0094tgFuq-0ulhnXH1EGG_mqj8CppssdJxK-IAjF2ejvViTyNHoxlN8Mjr5lpTR4FEbijRM2Hq1vrNs--enNKzUs_g-hJv2-_f8BH5ZqVZeDae9Zan_RclsU5TBMy7OoWh9GRZTHyatf4_Xe7g2UG6KFRlkcx4xqOxYva2uhxHYriyi1IdT7865-Ju-cjqtduRL5f9TlpS9v8giOOpbBNPLskQ0xcLucblpF9866iMejFDmmfT9NSKLQ84EzCkJJ_taTCTkzCzkoN06vW_Zr0Y-mwrnJdBK68OBSJU.y9lNCRNrWDQt0Lfe8cDQFENzcxb28nLDeh2DysqX0Kk&dib_tag=se&keywords=mind-gut+connection&qid=1763928438&sprefix=mind-gut+%2Caps%2C129&sr=8-1" },
      { title: "Brain Energy - Christopher Palmer", url: "https://www.amazon.ca/gp/product/1637741588/ref=ewc_pr_img_2?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Why We Get Sick - Benjamin Bikman", url: "https://www.amazon.ca/gp/product/1953295770/ref=ewc_pr_img_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Blue Zones: 9 Lessons for Living Longer - Dan Buettner", url: "https://www.amazon.ca/gp/product/1426209487/ref=ox_sc_saved_title_1?smid=A3DWYIK6Y9EEQB&psc=1" },
    ],
  },
  {
    id: "philosophy",
    name: "Philosophy",
    books: [
      { title: "Utilitarianism and Other Essays - John Stuart Mill", url: "https://www.amazon.ca/Utilitarianism-Other-Essays-John-Stuart/dp/0140432728/ref=asc_df_0140432728?mcid=2b736eab5f423fdc9670f75ef0294569&tag=googleshopc0c-20&linkCode=df0&hvadid=706761993511&hvpos=&hvnetw=g&hvrand=14059194314550594551&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-489325039193&psc=1&gad_source=1" },
      { title: "Fear and Trembling - Soren Kierkegaard", url: "https://www.amazon.ca/gp/product/0140444491/ref=ox_sc_saved_image_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Purity of Heart is to Will One Thing - Soren Kierkegaard", url: "https://www.amazon.ca/gp/product/160386623X/ref=ox_sc_saved_image_2?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "A Treatise of Human Nature - David Hume", url: "https://www.amazon.ca/Treatise-Human-Nature-David-Hume/dp/0486432505" },
      { title: "The Ethics of Belief - William Kingdon Clifford", url: "https://www.amazon.ca/Ethics-Belief-Other-Essays/dp/1573926914" },
      { title: "Discourse on Method - René Descartes", url: "https://www.amazon.ca/Discourse-Method-Meditations-First-Philosophy/dp/0872204200/ref=mp_s_a_1_1?adgrpid=65154363110&dib=eyJ2IjoiMSJ9.iLqEHOyCB4Kw7t_S512wS5s1kc6NhLULAMiwL8JqCkk1XUsWlmEx1Oz0DyWwk6uWKpQkhFHYnqpMRY2bvbWb1cRjoKh2dFl0efltt697OwdL7B1Jq5f-Ch3DjM217_uArCMsLHSBPvqUJd8X0flvbQ5rDy7Yr9rXkI5Q7YWDRfYOnu725RlZHVvRQGNcv1YJXNakOS1ZwI7d3n602-uTLQ.S3C3aTcKY90ZQ-_8ohoaJqSuqPFmnzteXl4TtyZQy3k&dib_tag=se&gad_source=1&hvadid=310045304051&hvdev=m&hvexpln=0&hvlocphy=1002459&hvnetw=g&hvocijid=8771773081346764257--&hvqmt=e&hvrand=8771773081346764257&hvtargid=kwd-295402998134&hydadcr=8685_9621611&keywords=discourse+on+method&mcid=1f32bc4fa1373ff3a0df31962ce8ddbd&qid=1755204445&sr=8-1" },
    ],
  },
  {
    id: "theology",
    name: "Theology",
    books: [],
  },
  {
    id: "novels",
    name: "Novels",
    books: [
      { title: "A Gentleman in Moscow - Amor Towles", url: "" },
      { title: "Brave New World - Aldous Huxley", url: "" },
      { title: "Go Tell it on the Mountain", url: "" },
      { title: "The Great Gatsby", url: "" },
      { title: "The Old Man and the Sea - Ernest Hemingway", url: "https://www.amazon.ca/Old-Man-Sea-Ernest-Hemingway/dp/0684801221" },
      { title: "Mother Night - Kurt Vonnegut", url: "https://www.amazon.ca/Mother-Night-Novel-Kurt-Vonnegut/dp/0385334141/ref=asc_df_0385334141?mcid=ed2d1740796a393e858427f7e5d2db3e&tag=googleshopc0c-20&linkCode=df0&hvadid=706745563339&hvpos=&hvnetw=g&hvrand=1612089937027016350&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-514676172877&psc=1&gad_source=1" },
      { title: "The Remains of the Day - Kazuo Ishiguro", url: "https://www.amazon.ca/gp/product/0679731725/ref=ox_sc_act_title_19?smid=A1LIIVNAFQL1B&psc=1" },
      { title: "The New Atlantis - Francis Bacon", url: "https://www.amazon.ca/gp/product/1515427978/ref=ox_sc_act_title_5?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Lone Survivor - Marcus Luttrell", url: "https://www.amazon.ca/gp/product/031632406X/ref=ox_sc_act_title_9?smid=A12O770K084T99&psc=1" },
      { title: "The Fountainhead", url: "https://www.amazon.ca/gp/product/0452273331/ref=ox_sc_act_title_12?smid=A12UFBL1JPT2UF&psc=1" },
      { title: "Waiting for Godot - Samuel Beckett", url: "https://www.amazon.ca/gp/product/080214442X/ref=ox_sc_act_title_7?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Atlas Shrugged - Ayn Rand", url: "https://www.amazon.ca/Atlas-Shrugged-Ayn-Rand/dp/0451191145" },
    ],
  },
  {
    id: "multi-category",
    name: "Multi-category",
    books: [
      { title: "Walden - Henry David Thoreau", url: "https://www.amazon.ca/Walden-Henry-David-Thoreau/dp/1619493918" },
      { title: "The Art of War", url: "" },
      { title: "Tao te Ching - Lao Tzu", url: "https://www.amazon.ca/gp/product/1537196472/ref=ox_sc_saved_image_1?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Who Rules the World? - Noam Chomsky", url: "https://www.amazon.ca/Who-Rules-World-Noam-Chomsky/dp/1250131081/ref=asc_df_1250131081?mcid=65b3781853ed3d0389c819d63b23686f&tag=googleshopc0c-20&linkCode=df0&hvadid=706766558284&hvpos=&hvnetw=g&hvrand=8700900700900314638&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000838&hvtargid=pla-428502734058&psc=1&gad_source=1" },
      { title: "Zen and the Art of Motorcycle Maintenance - Robert M Pirsig", url: "https://www.amazon.ca/gp/product/0060839872/ref=sw_img_1?smid=A3JW9M0XC1U6Q6&psc=1" },
      { title: "A Rule Book for Arguments - Anthony Weston", url: "https://www.amazon.ca/gp/product/162466654X/ref=ewc_pr_img_3?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "An Unfinished Love Story: Personal History of 1960s - Doris Kearns Goodwin", url: "https://www.amazon.ca/gp/product/1982108665/ref=ox_sc_act_title_2?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "The Moral Case for Fossil Fuels - Alex Epstein", url: "" },
      { title: "False Alarm (Climate Change Panic) - Bjørn Lomborg", url: "" },
      { title: "Thinking in Systems - Diana Wright", url: "https://www.amazon.ca/Thinking-Systems-Primer-Donella-Meadows/dp/1603580557" },
      { title: "The Black Swan: The Impact of the Highly Improbable - Nassim Nicholas Taleb", url: "https://www.amazon.ca/gp/product/1400063515/ref=ox_sc_act_title_16?smid=A3DWYIK6Y9EEQB&psc=1" },
      { title: "Creative Selection: Inside Apple's Design Process During the Golden Age of Steve Jobs", url: "https://www.amazon.ca/gp/product/1250203414/ref=ewc_pr_img_2?smid=A3DWYIK6Y9EEQB&psc=1" },
    ],
  },
];

const nextTitles = [
  "Fiber Fueled - Will Bulsiewicz",
  "The Beginning of Infinity - David Deutsch",
  "The Art and Science of Digital Marketing and Advertising - Alex Schultz",
];
const currentlyReadingTitles = ["Measure What Matters"];

function buildReadingList() {
  const idByTitle = new Map();
  const result = {
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      books: (cat.books || []).map((b) => {
        const id = randomUUID();
        idByTitle.set(b.title, id);
        return { id, title: b.title, url: b.url || "" };
      }),
    })),
    next: [],
    currentlyReading: [],
  };

  for (const t of nextTitles) {
    const id = idByTitle.get(t);
    if (id) result.next.push(id);
  }
  for (const t of currentlyReadingTitles) {
    const id = idByTitle.get(t);
    if (id) result.currentlyReading.push(id);
  }

  return result;
}

const data = buildReadingList();
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
console.log("Wrote", outPath);
