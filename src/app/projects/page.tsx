import Contents from '../components/Contents'
import LightboxImage from '../components/LightboxImage';

const ProjectsPage = () => {
  const articles = [
    { id: 'jgi-genome-portal', title: 'JGI Genome Portal' },
    { id: 'elviz-metagenome-visualization', title: 'Elviz: metagenome visualization' },
    {
      id: 'biopig-hadoop-based-genomic-analysis-toolkit',
      title: 'BioPig: Hadoop-based Genomic Analysis Toolkit'
    },
    {
      id: 'commerceroute-data-integration-and-workflow-solutions',
      title: 'CommerceRoute Data Integration and Workflow'
    },
    {
      id: 'multi-dimensional-clustering',
      title: 'Multi-dimensional Clustering Algorithm'
    },
    {
      id: 'compressed-bitmap-index',
      title: 'Compressed Bitmap Index'
    },
    {
      id: 'query-estimator-for-petabyte-storage-systems',
      title: 'Query Estimator for Petabyte Storage Systems'
    },
    {
      id: 'cosmic-microwave-background-cmb-spectrum-analysis',
      title: 'Cosmic Microwave Background (CMB) Spectrum Analysis'
    },
    { id: 'isotope-explorer', title: 'Isotope Explorer' },
    { id: 'batmud', title: 'BatMUD' }
  ]

  return (
    <main className="page-with-contents">
      <Contents articles={articles} />
      <section className="card-grid">

        <div className="card" id="jgi-genome-portal">
          <div className="card-title">JGI Genome Portal</div>
          <div className="card-title-subtitle">2008 - 2014 • JavaScript, AngularJS, Perl</div>
          <div className="card-text">
            The Department of Energy (DOE) Joint Genome Institute (JGI) is a national user facility with massive-scale DNA 
            sequencing and analysis capabilities dedicated to advancing genomics for bioenergy and environmental applications.
            Beyond generating tens of trillions of DNA bases annually, the Institute develops and maintains data management
            systems and specialized analytical capabilities to manage and interpret complex genomic data sets, and to enable
            an expanding community of users around the world to analyze these data in different contexts over the web.
            <LightboxImage 
                src="/img/genome-portal-tree-of-life.jpg" 
                alt="Genome Portal Landing Page" 
                width={800} 
                height={600}
                className="pt-4 pb-4"
                caption="Tree of Life showing sequenced organisms and samples"
              />
            The JGI Genome Portal (<a href="https://genome.jgi.doe.gov">genome.jgi.doe.gov</a>) provides a unified access point
            to all JGI genomic databases and analytical tools. A user can find all DOE JGI sequencing projects and their status,
            search for and download assemblies and annotations of sequenced genomes, and interactively explore those genomes
            and compare them with other sequenced microbes, fungi, plants or metagenomes using specialized systems tailored
            to each particular class of organisms.
            As Team Lead, I was
            responsible for this portal, which provides access to data at multiple stages of genome analysis and annotation
            pipelines.<br/><br/>
            We published a paper on it in Nucleic Acids Research in 2012: <a href="https://doi.org/10.1093/nar/gkr947">
            The Genome Portal of the Department of Energy</a>.
          </div>
          <div className="card-subtitle pt-4">Technology</div>
          <div className="card-text">
            The Genome Portal is built using a combination of technologies. The genome browser (annotation and assembly viewer)
            is a large Perl program. When I took over, I implemented parallel rendering of the different tracks (see image below).
            I also added a number of long requested features. 
            <LightboxImage 
                src="/img/genome-portal-browser.png" 
                alt="Genome Portal browser" 
                width={800} 
                height={600}
                className="pt-4 pb-4"
                caption="Genome browser implemented in Perl"
              />
          </div>
        </div>

        <div className="card" id="elviz-metagenome-visualization">
          <div className="card-title">Elviz: metagenome visualization</div>
          <div className="card-title-subtitle">2015 • AngularJS, JavaScript, WebGL</div>
          <div className="card-text">
              <LightboxImage 
                src="/img/elviz.png" 
                alt="Elviz -- metagenome visualization" 
                width={800} 
                height={600}
                className="pb-4"
                caption="Interactive visualization of metagenome assemblies"
              />
              Elviz (Environmental Laboratory Visualization) is an interactive web-based tool
              for the visual exploration of assembled metagenomes and their complex metadata.
              Elviz allows scientists to navigate metagenome assemblies across multiple dimensions and scales, plotting parameters
              such as GC content, relative abundance, phylogenetic affiliation and assembled contig length. Furthermore Elviz enables
              interactive exploration using real-time plot navigation, search, filters, axis selection, and the ability to drill from
              a whole-community profile down to individual gene annotations.
            </div>
            <div className="card-subtitle pt-4">Technology</div>
            <div className="card-text">
              Elviz is written in AngularJS, JavaScript, and WebGL. Try it out 
              at <a href="https://genome.jgi.doe.gov/viz">genome.jgi.doe.gov/viz</a>. We published a paper on
              it in BMC Bioinformatics in 2015: <a href="https://doi.org/10.1186/s12859-015-0566-4">Elviz – exploration
              of metagenome assemblies with an interactive visualization tool</a>.
            </div>
        </div>


        <div className="card" id="biopig-hadoop-based-genomic-analysis-toolkit">
          <div className="card-title">BioPig: Hadoop-based Genomic Analysis Toolkit</div>
          <div className="card-title-subtitle">2013 • Java, Python, Pig Latin, Hadoop</div>
          <div className="card-text">BioPig is a Hadoop-based analytic toolkit designed to scale large-scale sequence analysis
            to data volumes that overwhelm traditional tools. It sits on top of Hadoop MapReduce and the Pig data-flow language
            to provide a higher-level, more programmable framework for bioinformatics tasks, with emphasis on scalability,
            portability, and ease of use. We published a paper on it in Bioinformatics in 
            2013: <a href="https://doi.org/10.1093/bioinformatics/btt528">BioPig: a Hadoop-based analytic toolkit for large-scale sequence data</a>.
          </div>
          <div className="card-subtitle pt-4">Origin</div>
          <div className="card-text">
            In 2010, as I was working on the Genome Portal, I collaborated with Dr. Zhong Wang's Genome Analysis 
            research group at the Joint Genome Institute (JGI) to develop BioPig. Researchers at the JGI assemble genomes
            from raw sequence data using supercomputers at NERSC. BioPig was envisioned as a way to scale beyond the current
            methods. 
            It was written by me and Karan Bhatia, using Java and Pig Latin. The source code 
            is <a href="https://github.com/JGI-Bioinformatics/biopig">available on GitHub</a>.
          </div>
          <div className="card-subtitle pt-4">Performance and Scalability</div>
          <div className="card-text">
            Empirical results compare BioPig against serial and MPI implementations, using datasets from 100 Mb (Mega basepairs)
            up to 500 Gb. BioPig demonstrates near-linear scaling with data size on Hadoop clusters (e.g., Magellan/NERSC and AWS EC2),
            whereas traditional serial/MPI approaches hit memory limits or scale poorly in practice due to high-latency or 
            bespoke parallelization requirements. While there is a certain amount of overhead thanks to Hadoop’s startup,
            for very large datasets the data-analysis time dominates startup costs.
            <LightboxImage 
              src="/img/biopig-graphs.png" 
              alt="BioPig performance and scalability" 
              width={800} 
              height={600}
              className="pt-4"
              caption="Performance comparison showing near-linear scaling with data size"
            />
          </div>
          <div className="card-subtitle pt-4">Example</div>
          <div className="card-text">Below is a simple example of a Pig script to count kmers. For more advanced
            examples, see the <a href="https://github.com/JGI-Bioinformatics/biopig/tree/master/examples">examples</a> directory
            on GitHub, or the paper.
            <pre>
              -- a simple example of pig script to count kmers<br/>
              1 register /.../biopig-core-0.3.0-job-pig.jar<br/>
              2 A = load '$input' using gov.jgi.meta.pig.storage.FastaStorage as (id: chararray, d: int, seq: bytearray, header: chararray);<br/>
              3 B = foreach A generate flatten(gov.jgi.meta.pig.eval.KmerGenerator(seq, 20)) as (kmer:bytearray);<br/>
              4 C = group B by kmer parallel $p;<br/>
              5 D = foreach C generate group, count(B);<br/>
              6 E = group D by $1 parallel $p;<br/>
              7 F = foreach E generate group, count(D);<br/>
              8 store F into '$output';<br/>
            </pre>
          </div>
        </div>

        <div className="card" id="commerceroute-data-integration-and-workflow-solutions">
          <div className="card-title">CommerceRoute Data Integration and Workflow Solutions</div>
          <div className="card-title-subtitle">1997 - 2003 • C++, Microsoft MFC, Java</div>
          <div className="card-text">In 1997 I was the engineering founder of what became CommerceRoute.
            The first product was a workflow/Business Process Modeling (BPM) offering. It featured a client tool
            for defining the flow, a rules database, and a rules engine. You would define a workflow process,
            with tasks linked together by routes. It didn't have any restrictions on how complicated the flow could be,
            allowing recursive flows and multiple instances of the same task. Right away people wanted to pull
            in data from external sources, and use them in the logic. We started adding connections to databases,
            LDAP, SAP, FTP, local files, and formats like XML, EDI, flat files, etc.
            With time people started to use the flows for data movement instead
            of just process automation. That's how the next product was born.
          </div>
          <div className="card-subtitle pt-4">Data Integration</div>
          <div className="card-text">
            Building upon the powerful engine, we developed the CommerceRoute data integration solution, 
            which handles transformations and transfers between sources and targets, and implemented the 
            RosettaNet B2B framework. The complete solution was later sold as the Syncx integration appliance,
            reducing support costs. 
          </div>
          <div className="card-subtitle pt-4">CommerceRoute SaaS</div>
          <div className="card-text">
            The launch of CommerceRoute Syncx was accompanied by a new SaaS offering: commerceroute.net
            All Syncx appliances talked to commerceroute.net and reported health and usage data. As needed,
            updates were pushed to the appliances. This included both OS level security updates and new features.
            <LightboxImage 
              src="/img/commerceroute-web-data-interchange-login.png" 
              alt="CommerceRoute Web Data Interchange Login" 
              width={800} 
              height={600}
              className="pt-4"
              caption="CommerceRoute SaaS web interface"
            />
          </div>
          <div className="card-subtitle pt-4">Acquisition</div>
          <div className="card-text">In 2003 a new company was formed to acquire the product. The new company was called 
            Jitterbit, and it acquired the technology from CommerceRoute. A few of the founders of CommerceRoute stayed on
            to start Jitterbit. Jitterbit is now a cloud-based data integration company recognized as a leader 
            and visionary in the iPaaS field.
          </div>
          <div className="card-subtitle pt-4">Technology and Architecture</div>
          <div className="card-text">
            The engine was written in C++ using boost libraries. The workflow client was written in C++ using Microsoft's MFC library.
            For a while Jitterbit open sourced the product, and it is <a href="https://sourceforge.net/p/jitterbit/code/HEAD/tree/">available</a> on
            SourceForge. After a while Jitterbit completely stopped using the workflow product and focused on the data integration product.
            But it wasn't until 2009 that they pushed an update to remove the workflow logic from the code. So you can still find my
            original code in the repository by <a href="https://sourceforge.net/p/jitterbit/code/30994/tree/trunk/">going back through the history</a>.
            For example the <a href="https://sourceforge.net/p/jitterbit/code/39302/tree/trunk/integration/cpp/konga/ProcessEngine/Engine/RoutingEngineCore.cpp">RoutingEngineCore.cpp</a> file
            handles the routing logic for the workflow.
          </div>
          <div className="card-subtitle pt-4">Scaling</div>
          <div className="card-text">
            The workflow engine is multi-threaded and will detect the number of cores available and use them. It is also able to scale
            as a cluster of machines. In this mode, synchronization is handled via the database. The standard Syncx appliance configuration
            started with 2 multi-core machines and one database server. From there, customers would add capacity as needed by adding more machines.
            This was designed to be a simple process and was done via the web interface. For enterprises, they would add a second database server,
            which would run in a two-phase commit mode to ensure data consistency. In that mode, each query is executed in a way that
            the transaction succeeds only after both database servers have confirmed a successful commit. During one demo we did to a large
            enterprise customer, we used a workflow with complex logic with loops and data dependencies 
            between tasks. In the middle of the demo, we pulled the power to the machine and waited for it to restart.
            When it came back online, the process continued and completed successfully. This was possible because the source of
            truth for the workflow logic and state was always the database.
          </div>
        </div>

        <div className="card" id="multi-dimensional-clustering">
          <div className="card-title">Multi-dimensional Clustering Algorithm</div>
          <div className="card-title-subtitle">1997 - 1999 • C++, Java</div>
          <div className="card-text">When I joined the Scientific Data Management R&D group at Lawrence Berkeley Laboratory in 1997,
            the first project I worked on was a multi-dimensional clustering algorithm. As the high energy physics community was preparing
            for the Large Hadron Collider, they looked to our group to help manage the data. My task was to come up with an 
            algorithm to find clusters of collision events. An "event" is when two particles collide in a collider. The data describes
            how many of each type of elementary particle were produced in the collision, along with data for each particle,
            such as momentum and energy.
          </div>
          <div className="card-subtitle pt-4">The Curse of Dimensionality</div>
          <div className="card-text">
            We were dealing with 100 - 150 columns or dimensions of data.
            Classical clustering algorithms like k-means or hierarchical clustering break down
            when you have that many dimensions. This is known as the curse of dimensionality.
            The events tend to cluster into groups of events that are similar. My task was to find them.
          </div>
          <div className="card-subtitle pt-4">Algorithm</div>
          <div className="card-text"> I relied on the fact that the data is very sparse in higher dimensions. 
            Since the number of events was large but known, I decided to use a hash table to store information about
            only the non-empty cells. The algorithm was:
            <ul className="list">
              <li>Read the data (one pass) and populate the cells</li>
              <li>Sort the cells by the number of events</li>
              <li>Grow cluster around the largest cell. Find all neighbors of Manhattan distance 1.
                Stop growing when events in a cell are below a threshold, or when the gradient
                increases.</li>
              <li>Then grow the cluster around the <i>next available</i> largest cell. </li>
              <li>Repeat until all cells are in a cluster</li>
            </ul> 
          </div>
          <div className="card-subtitle pt-4">Technology</div>
          <div className="card-text">
            The algorithm was implemented in C++ on Solaris. I used a hash table to store the data. In addition 
            to the algorithm, we also developed a Java Applet that could be used to explore the clusters. 
            <LightboxImage 
              src="/img/cluster-explorer-applet.png" 
              alt="Multi-dimensional Clustering" 
              width={800} 
              height={600}
              className="pt-4 pb-4"
              caption="Java applet for exploring multi-dimensional clusters"
            />
            Selecting the bins was a task of its own. The Java Applet allowed you to explore what bins 
            yielded the best clusters.
          </div>
        </div>

        <div className="card" id="compressed-bitmap-index">
          <div className="card-title">Compressed Bitmap Index</div>
          <div className="card-title-subtitle">1997 - 1999 • C++</div>
          <div className="card-text">To be able to serve high energy physics data from tape systems, we needed to be able
            to quickly estimate the size of a result set for a particular query before the data retrieval request was executed.
            This would allow the scientists to refine their queries before retrieving the data. 
            To this end, I researched and implemented a specialized compressed bitmap (a.k.a. bit-sliced) index that is highly
            effective for range queries. The queries were logical joins of ranges on several columns.
            A key feature of this work is the ability to perform query execution directly without
            needing to decompress the index first. 
            One idea was to run clustering on the data, and re-order the events based on clusters. 
            In 1995 Gennady Antoshenkov developed the Byte-aligned Bitmap Code (BBC), a well-known scheme for bitmap compression.
            Our work is similar but we added several novel features to make them more efficient for our use case.
          </div>
          <div className="card-subtitle pt-4">Algorithm</div>
          <div className="card-text">
            We assume that the objects are stored in a certain order in the index, and this order does not change.
            Thus, we first generate vertical partitions for each of the 100 properties. If all the properties are
            short integers, the size of all the partitions is 20 GBs (100 × 2 × 10⁸ bytes). The size doubles if 
            all were real numbers. The vertical partitions are stored on disk. Now the bit-sliced index is designed
            to be a concise representation of these partitions, so that it is much smaller and can be stored in memory.
            Since the properties we deal with are numeric, we can partition each dimension into bins. For example, we
            can partition the "energy" dimension into 1–2 GeV, 2–3 GeV, and so on. We then assign to each bin a bit
            vector, where a "0" means that the value for that object does not fall in that bin, and "1" means it does.
            <LightboxImage 
              src="/img/bit-slices.png" 
              alt="Partitions" 
              width={800} 
              height={600}
              className="pt-4 pb-4"
              caption="Example of bit-sliced index partitions"
            />
            The figure shows an example where Property 1 was partitioned into 7 bins, Property 2 into 5 bins, etc. Note
            that only a single "1" can exist for each row of each property, since the value only falls into a single bin.
            <br/><br/>
            We now compress the vertical bit-vectors using a modified version of run-length encoding. The advantage of
            this scheme is that boolean operations can be performed directly on the compressed vectors without decompression.
            This scheme is particularly effective for highly skewed data such as High Energy Physics data. Our version of
            run-length encoding does not encode short sequences into counts. Instead, it represents them as-is. A single
            bit in each word indicates whether it is a count or a pattern. Results show a compression factor
            of 10-100.
            The choice of bins and bin boundaries has a significant impact on compression. Assume 100 properties,
            each with 10 bins. This requires 10¹¹ bits before compression. With a compression factor of 100, the 
            space required is 10⁹ bits, or about 125 MBs. This can be stored permanently in memory. Note that it 
            is not necessary to keep all bit slices in memory. Only the most relevant slices for a query need to be retained.
          </div>
          <div className="card-subtitle pt-4">Logical Operations on bit slices</div>
          <div className="card-text">
            The compression scheme described above permits logical operations on the compressed bit-slices (bitmap columns). This
            is an important feature of the compression algorithm used, since it makes it possible to do the operations in memory.
            These operations take as input two compressed slices and produce one compressed slice (the input for "negation" is only
            one bit-slice).

            All logical operations are implemented the same way:
            <ul className="list">
              <li>The state ["0" or "1"] at the current position and the number of bits of the current run (number of consecutive
                  bits of that same state), 'num', from each bit-slice, are extracted (decoded).
              </li>
              <li>
                  The result is created (encoded) by performing the required logical operation (AND, OR, XOR) on the state bits from
                  each bit-slice and subtracting the smaller 'num' from the larger and appending the result to the resulting
                  bit-slice. The resulting bit-slice is encoded as we go along, using the most efficient method for the size of its
                  run lengths.
              </li>
            </ul>
            An example: pseudo code for logical or:
            <pre>{`function bmp_or( bitslice left,
                 bitslice right )
{
  while( there_are_more_bits(left) 
    and there_are_more_bits(right) )
  {
    lbit = decode( left, lnum );
    rbit = decode( right, rnum );
    result_bit = lbit | rbit;
    result_num = min( lnum, rnum );

    lnum = lnum - result_num;
    rnum = rnum - result_num;
    encode( result, 
            result_bit,
            result_num );
  }
  return result;
}`}</pre>
          </div>
        </div>

        <div className="card" id="cosmic-microwave-background-cmb-spectrum-analysis">
          <div className="card-title">Cosmic Microwave Background (CMB) Spectrum Analysis</div>
          <div className="card-title-subtitle">1996 - 1998 • Fortran</div>
          <div className="card-text">
            This research involved a detailed analysis of observations related to the Cosmic
            Microwave Background (CMB) radiation intensity, a relic of the Big Bang.
            In 1995 and 1996 I worked on the Isotope Explorer (see below) while also completing 
            MSc in Physics, taking classes at UC Berkeley. When it came time to write my thesis,
            Dr. Richard Firestone of the Isotopes Project at LBL put me in touch with Dr. George Smoot,
            who had recently gathered data from his DMR experiment onboard the COBE satellite.
          </div>
          <div className="card-subtitle pt-4">Nobel Prize</div>
          <div className="card-text">
            The DMR data showed that the CMB was not uniform, but had a large difference in one direction,
            and small variations all around. This dipole pattern showed the motion of our solar system,
            and our local group of galaxies relative to the CMB. George received the Nobel Prize in Physics
            in 2006 for this work.
            <LightboxImage 
              src="/img/george-smoot.jpg" 
              alt="Dr. George Smoot and Dr. Steven Chu" 
              width={800} 
              height={600}
              className="pt-4 pb-4"
              caption="Dr. Chu and Dr. Smoot on the day of the Nobel Prize announcement. Photo: Henrik Nordberg"
            />
            The image shows Dr. George Smoot and Dr. Steven Chu, who was the lab director at the time and
            also the Secretary of Energy; on the day of the announcement of the Nobel Prize in Physics in October 2006. Dr. Chu
            received the Nobel Prize in Physics in 1997. As a side note, Berkeley Lab is an amazing place.
            George would tell me stories about his advisor, Luis Alvarez, who also was a Nobel Laureate in Physics (1968).
            So you know, I still have a few years... :) I would attend the INPA (Institute for Nuclear and Particle Astrophysics)
            seminars on a regular basis.
            Whenever a new important paper in physics was published, the authors would come and give a talk.
            The lab has had 17 Nobel Prize winners affiliated with it. 
          </div>
          <div className="card-subtitle pt-4">Data Analysis</div>
          <div className="card-text">
            In addition to the COBE data, George and I collected all known published data on the CMB spectrum.
            I then wrote Fortran code to fit the data to various models. 
          </div>
        </div>

        <div className="card" id="query-estimator-for-petabyte-storage-systems">
          <div className="card-title">Query Estimator for Petabyte Storage Systems</div>
          <div className="card-title-subtitle">1998 - 1999 • C++</div>
          <div className="card-text">To be able to serve high energy physics data from tape systems, we needed to be able
            to quickly estimate the size of a result set for a particular query before the data retrieval request was executed.
            This would allow the scientists to refine their queries before retrieving the data.
          </div>
        </div>

        <div className="card" id="isotope-explorer">
          <div className="card-title">Isotope Explorer</div>
          <div className="card-title-subtitle">1995 • C++, Borland OWL, Microsoft MFC</div>
          <div className="card-text">In 1995 I moved to Berkeley to work on a visualization tool for nuclei of isotopes 
            at Lawrence Berkeley Laboratory.
            Originally called VuENSDF, it is a tool for exploring the nuclear data from the ENSDF database. Up till then,
            when you needed to access nuclear energy level data, you used the Table of Isotopes (ToI), which was a thick book.
            ToI was published by the Isotopes Project, a research group at the Nuclear Science Division of LBL. That group was
            headed by Nobel Laureate Glenn T. Seaborg, who still checked in on us from time to time. Dr. Seaborg was famous
            for the discovery of the elements plutonium, americium, curium, berkelium, californium, einsteinium,
            fermium, mendelevium, nobelium, and seaborgium.
            <LightboxImage 
              src="/img/isotope-explorer.png" 
              alt="Isotope Explorer" 
              width={800} 
              height={600}
              className="pt-4"
              caption="Isotope Explorer visualization tool"
            />
          </div>
          <div className="card-subtitle pt-4">Technology</div>
          <div className="card-text">
            The tool was written in C++ and Borland's OWL library for Windows. One weekend I was reading the C code for
            the Unix Telnet server and decided to see if I could talk to it from Isotope Explorer. This led to us adding
            access to a large document set of references to the nuclear data. This was a web service before the term was invented.
          </div>
          <div className="card-subtitle pt-4">Features</div>
          <div className="card-text">
            Isotope Explorer can display level drawings, coincidences, tables, band plots, nuclear charts, chart data and literature references.
          </div>
        </div>

        <div className="card" id="batmud">
          <div className="card-title">BatMUD</div>
          <div className="card-title-subtitle">1991 • LPC</div>
          <div className="card-text">A MUD (Multi-User Dungeon) is an online role-playing game. In 1991 I was at the
            university and joined BatMUD as a player. Back then you accessed the game via a telnet client.
            I wizzed (reached level 20 and beat Tiamat) and started extending the
            game as all wizards do. This is how I discovered my love of programming. I started working on the backend, adding a
            'feelings' system and the first global event (orch raids), among other things. The coding for LPC MUDs is in LPC, an object-oriented
            version of C. My player character is the Archwizard Plura.</div>
        </div>

        <div className="card hidden">
          <div className="card-title">.</div>
          <div className="card-text">.
          </div>
          <div className="card-subtitle pt-4">.</div>
          <div className="card-text">.
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProjectsPage;
