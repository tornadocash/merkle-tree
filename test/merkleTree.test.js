require('chai').should()
const MerkleTree = require('../src/merkleTree')
const { mimcsponge } = require('circomlib')
const { bigInt } = require('snarkjs')
const mimc = (left, right) => mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString()
const DEFAULT_ZERO = '21663839004416932945382355908790599225266501822907911457504978515578255421292' // keccak256("tornado") % BN254_FIELD_SIZE

// todo negative test cases for:
//   - full tree
//   - invalid indexes
describe('MerkleTree', () => {
  describe('#constructor', () => {
    it('should have correct zero root', () => {
      const tree = new MerkleTree(10, [], mimc, DEFAULT_ZERO)
      return tree.root().should.equal('14030416097908897320437553787826300082392928432242046897689557706485311282736')
    })

    it('should have correct 1 element root', () => {
      const tree = new MerkleTree(10, [1], mimc, DEFAULT_ZERO)
      return tree.root().should.equal('8423266420989796135179818298985240707844287090553672312129988553683991994663')
    })

    it('should have correct even elements root', () => {
      const tree = new MerkleTree(10, [1, 2], mimc, DEFAULT_ZERO)
      return tree.root().should.equal('6632020347849276860492323008882350357301732786233864934344775324188835172576')
    })

    it('should have correct odd elements root', () => {
      const tree = new MerkleTree(10, [1, 2, 3], mimc, DEFAULT_ZERO)
      return tree.root().should.equal('13605252518346649016266481317890801910232739395710162921320863289825142055129')
    })
  })

  describe('#insert', () => {
    it('should insert into empty tree', () => {
      const tree = new MerkleTree(10, [], mimc, DEFAULT_ZERO)
      tree.insert(42)
      return tree.root().should.equal('5305397050004975530787056746976521882221645950652996479084366175595194436378')
    })

    it('should insert into odd tree', () => {
      const tree = new MerkleTree(10, [1], mimc, DEFAULT_ZERO)
      tree.insert(42)
      return tree.root().should.equal('4732716818150428188641303198013632061441036732749853605989871103991103096471')
    })

    it('should insert into even tree', () => {
      const tree = new MerkleTree(10, [1, 2], mimc, DEFAULT_ZERO)
      tree.insert(42)
      return tree.root().should.equal('6204016789747878948181936326719724987136198810274146408545977300318734508764')
    })
  })

  describe('#update', () => {
    it('should update first element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.update(0, 42)
      return tree.root().should.equal('153077538697962715163231177553585573790587443799974092612333826693999310199')
    })

    it('should update last element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.update(4, 42)
      return tree.root().should.equal('1955192134603843666100093417117434845771298375724087600313714421260719033775')
    })

    it('should update odd element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.update(1, 42)
      return tree.root().should.equal('6642888742811380760154112624880866754768235565211186414088321870395007150538')
    })

    it('should update even element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.update(2, 42)
      return tree.root().should.equal('11739358667442647096377238675718917508981868161724701476635082606510350785683')
    })
  })

  describe('#indexOf', () => {
    it('should find index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.indexOf(3).should.equal(2)
    })

    it('should return -1 for non existent element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      tree.indexOf(42).should.equal(-1)
    })
  })

  describe('#proof', () => {
    it('should work for even index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      const proof = tree.proof(2)
      proof.pathIndex.should.be.deep.equal([0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      proof.pathElements.should.be.deep.equal([
        4,
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
        '14506027710748750947258687001455876266559341618222612722926156490737302846427',
        '4766583705360062980279572762279781527342845808161105063909171241304075622345',
        '16640205414190175414380077665118269450294358858897019640557533278896634808665',
        '13024477302430254842915163302704885770955784224100349847438808884122720088412',
        '11345696205391376769769683860277269518617256738724086786512014734609753488820',
        '17235543131546745471991808272245772046758360534180976603221801364506032471936',
        '155962837046691114236524362966874066300454611955781275944230309195800494087',
      ])
    })

    it('should work for odd index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5], mimc, DEFAULT_ZERO)
      const proof = tree.proof(3)
      proof.pathIndex.should.be.deep.equal([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      proof.pathElements.should.be.deep.equal([
        3,
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
        '14506027710748750947258687001455876266559341618222612722926156490737302846427',
        '4766583705360062980279572762279781527342845808161105063909171241304075622345',
        '16640205414190175414380077665118269450294358858897019640557533278896634808665',
        '13024477302430254842915163302704885770955784224100349847438808884122720088412',
        '11345696205391376769769683860277269518617256738724086786512014734609753488820',
        '17235543131546745471991808272245772046758360534180976603221801364506032471936',
        '155962837046691114236524362966874066300454611955781275944230309195800494087',
      ])
    })
  })
})
